/**
 * Image Controller for PublicDomainDay
 * 
 * Handles all image-related operations including:
 * - Retrieving images with filtering, pagination, and search
 * - Uploading new images with metadata
 * - AI-powered image analysis for tags and descriptions
 * - Updating image information
 * - Deleting images
 * - Managing likes/engagement
 * 
 * Supports both local storage and S3 cloud storage for images
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Image = require('../models/Image');
const User = require('../models/User');
const AWS = require('aws-sdk');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Get all images
exports.getAllImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting options
    let sortOption = { createdAt: -1 }; // Default sort by newest
    if (req.query.sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (req.query.sort === 'popular') {
      // Sort by download count
      sortOption = { downloads: -1 };
    } else if (req.query.sort === 'views') {
      // Sort by view count
      sortOption = { views: -1 };
    }
    
    // Filter and search logic
    let filter = {};
    
    // Basic filters
    if (req.query.year) {
      if (req.query.year.includes('-')) {
        // Year range (e.g., 1900-1950)
        const [startYear, endYear] = req.query.year.split('-').map(Number);
        filter.year = { $gte: startYear, $lte: endYear };
      } else {
        filter.year = parseInt(req.query.year);
      }
    }
    
    if (req.query.author) {
      filter.author = { $regex: req.query.author, $options: 'i' };
    }
    
    // VERY STRICT TAG SEARCH IMPLEMENTATION - FIXES THE BICYCLES ISSUE
    if (req.query.tag) {
      // Get the search tag and log it
      const searchTag = req.query.tag.trim();
      console.log(`[TAG SEARCH] Looking for images with tag: "${searchTag}"`);
      
      // Use simple equality match for MongoDB array
      filter = { 
        $or: [
          { tags: searchTag },     // Exact tag match in user tags
          { aiTags: searchTag }    // Exact tag match in AI tags
        ]
      };
      
      // Log everything for debugging
      console.log(`[TAG SEARCH] MongoDB query: ${JSON.stringify(filter)}`);
      console.log(`[TAG SEARCH] Searching tags field for exact value: ${searchTag}`);
      console.log(`[TAG SEARCH] This is a strict equality match, no regex or substring matching`);
    }
    
    // Advanced search with AI-enhanced capabilities
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      
      // If we have a text index
      if (searchTerm) {
        if (mongoose.connection.collections.images.indexes().some(idx => idx.textIndexVersion)) {
          // Use text search if text index exists
          filter.$text = { $search: searchTerm };
          sortOption = { score: { $meta: 'textScore' } };
        } else {
          // Fallback to regex search if no text index
          const searchRegex = new RegExp(searchTerm, 'i');
          filter.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { aiDescription: searchRegex },
            { author: searchRegex },
            { tags: { $in: [searchRegex] } },
            { aiTags: { $in: [searchRegex] } }
          ];
        }
      }
    }

    // Execute query with all filters and sorting
    const images = await Image.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'username');
      
    // Log the number of images found
    console.log(`[TAG SEARCH] Found ${images.length} matching images`);
    
    // Log the first few images and their tags for debugging
    if (images.length > 0 && req.query.tag) {
      console.log("[TAG SEARCH] First image details:");
      console.log(`Title: ${images[0].title}`);
      console.log(`Tags: ${images[0].tags?.join(', ')}`);
      console.log(`AI Tags: ${images[0].aiTags?.join(', ')}`);
    }
      
    const totalImages = await Image.countDocuments(filter);
    
    res.json({
      images,
      totalPages: Math.ceil(totalImages / limit),
      currentPage: page,
      totalImages
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get image by ID
exports.getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)
      .populate('uploadedBy', 'username profileImage')
      .populate('likes', 'username profileImage');
      
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Increment view count
    image.views += 1;
    await image.save();
    
    // If authenticated user is the uploader, update their analytics
    if (req.user && image.uploadedBy && req.user.id === image.uploadedBy._id.toString()) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.analytics.totalViews += 1;
        await user.save();
      }
    }
    
    res.json(image);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload image
const aiService = require('../utils/aiService');

exports.uploadImage = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const { title, description, author, year, publicDomain, tags } = req.body;
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    let imageUrl;
    let storageLocation = 'local';
    let aiAnalysis = { tags: [], description: '', aiGenerated: false };
    
    try {
      // Analyze image with AI before uploading to S3 (we need local file access)
      if (process.env.OPENAI_API_KEY) {
        console.log('Analyzing image with AI...');
        aiAnalysis = await aiService.analyzeImage(req.file.path);
        console.log('AI analysis results:', aiAnalysis);
      } else {
        console.log('Skipping AI analysis (no API key)');
      }
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      // Continue with upload even if AI analysis fails
    }
    
    // If using S3 storage
    if (process.env.AWS_BUCKET_NAME && process.env.AWS_BUCKET_NAME !== 'your-bucket-name') {
      // Upload to S3
      const fileContent = fs.readFileSync(req.file.path);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `images/${Date.now()}-${req.file.originalname}`,
        Body: fileContent,
        ContentType: req.file.mimetype
      };
      
      const s3Response = await s3.upload(params).promise();
      imageUrl = s3Response.Location;
      storageLocation = 's3';
      
      // Remove local file after uploading to S3
      fs.unlinkSync(req.file.path);
    } else {
      // Use local storage
      imageUrl = `/uploads/${req.file.filename}`;
      console.log('Using local storage, image URL:', imageUrl);
    }
    
    // Combine user-provided tags with AI tags
    let combinedTags = [...tagArray];
    if (aiAnalysis.tags && aiAnalysis.tags.length > 0) {
      // Filter out duplicate tags
      const newAiTags = aiAnalysis.tags.filter(
        aiTag => !combinedTags.some(
          userTag => userTag.toLowerCase() === aiTag.toLowerCase()
        )
      );
      combinedTags = [...combinedTags, ...newAiTags];
    }
    
    // Use AI description as fallback if user didn't provide one
    const finalDescription = description && description.trim() 
      ? description.trim() 
      : aiAnalysis.description || '';
    
    // For debugging, print the entire request object
    console.log('Request headers:', req.headers);
    
    // In case req.user is undefined, don't try to access its properties
    const uploaderId = req.user ? req.user.id : null;
    
    console.log('Creating image document with:', {
      title,
      description: finalDescription,
      imageUrl,
      storageLocation,
      publicDomain,
      year,
      author,
      tags: combinedTags,
      uploadedBy: uploaderId,
      aiGenerated: aiAnalysis.aiGenerated,
      aiTags: aiAnalysis.tags || []
    });
    
    const newImage = new Image({
      title: title || 'Untitled Image', // Provide a default title if none
      description: finalDescription,
      imageUrl,
      storageLocation,
      publicDomain: publicDomain === 'true',
      year: year ? parseInt(year) : null,
      author: author || 'Unknown',
      tags: combinedTags,
      // No need for uploadedBy field if we don't have a user
      // If uploadedBy is null, MongoDB will not include the field
      ...(uploaderId ? { uploadedBy: uploaderId } : {}),
      // AI data
      aiGenerated: aiAnalysis.aiGenerated,
      aiDescription: aiAnalysis.description || '',
      aiTags: aiAnalysis.tags || [],
      aiMetadata: { 
        fullAnalysis: aiAnalysis.fullAnalysis || '' 
      },
      exifData: aiAnalysis.exifData || {}
    });
    
    const savedImage = await newImage.save();
    console.log('Image saved successfully:', savedImage);
    
    res.status(201).json(savedImage);
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update image
exports.updateImage = async (req, res) => {
  try {
    const { title, description, author, year, publicDomain, tags } = req.body;
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // No auth check - simplified for admin use only
    
    image.title = title || image.title;
    image.description = description || image.description;
    image.author = author || image.author;
    image.year = year ? parseInt(year) : image.year;
    image.publicDomain = publicDomain !== undefined ? publicDomain === 'true' : image.publicDomain;
    image.tags = tagArray.length > 0 ? tagArray : image.tags;
    
    await image.save();
    
    res.json(image);
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // No auth check - simplified for admin use only
    
    // If image is stored in S3, delete from there
    if (image.storageLocation === 's3') {
      const key = image.imageUrl.split('/').slice(-1)[0];
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `images/${key}`
      };
      
      await s3.deleteObject(params).promise();
    } else {
      // Delete local file
      const filePath = path.join(__dirname, '../../', image.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Image.deleteOne({ _id: image._id });
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Simplified like counter - just increments the like count
exports.toggleLike = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Simply add a like (for simplicity without auth)
    // We'll just use a dummy ID for now
    const dummyLikeId = new mongoose.Types.ObjectId();
    image.likes.push(dummyLikeId);
    
    await image.save();
    
    res.json({ 
      message: 'Image liked',
      likes: image.likes.length
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Download an image and track the download count
exports.downloadImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Increment download count
    image.downloads += 1;
    await image.save();
    
    // Determine the file path based on storage location
    if (image.storageLocation === 'local') {
      // For local files, send the file
      const filePath = path.join(__dirname, '../../', image.imageUrl);
      
      // Verify the file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Image file not found on server' });
      }
      
      // Get the original filename from the URL
      const originalFilename = path.basename(image.imageUrl);
      
      // Set content disposition header to prompt download
      res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`);
      res.sendFile(filePath);
    } else if (image.storageLocation === 's3') {
      // For S3 files, redirect to the image URL
      // For security, we should use a signed URL with expiration
      if (!process.env.AWS_BUCKET_NAME || process.env.AWS_BUCKET_NAME === 'your-bucket-name') {
        return res.status(500).json({ message: 'S3 not properly configured' });
      }
      
      // Extract key from URL
      const key = image.imageUrl.split('/').slice(-1)[0];
      
      // Generate signed URL
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `images/${key}`,
        Expires: 60 // URL expires in 60 seconds
      };
      
      const signedUrl = await s3.getSignedUrlPromise('getObject', params);
      
      // Redirect to the signed URL
      return res.redirect(signedUrl);
    } else {
      return res.status(500).json({ message: 'Invalid storage location' });
    }
  } catch (error) {
    console.error('Download image error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get trending images sorted by download count
exports.getTrendingImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category; // Optional category filter
    
    // Filter and search logic
    let filter = {};
    
    // VERY STRICT TAG SEARCH FOR TRENDING - SAME FIX AS MAIN TAG SEARCH
    // Add category filter if provided
    if (category) {
      // Use the same approach as the main tag search
      const searchTag = category.trim();
      console.log(`[TRENDING] Looking for trending images with category tag: "${searchTag}"`);
      
      // Use simple equality match for MongoDB array
      filter = { 
        $or: [
          { tags: searchTag },     // Exact tag match in user tags
          { aiTags: searchTag }    // Exact tag match in AI tags
        ]
      };
      
      console.log(`[TRENDING] MongoDB query: ${JSON.stringify(filter)}`);
      console.log(`[TRENDING] This is a strict equality match, no regex or substring matching`);
    }
    
    // Execute query with filters, sort by downloads
    const images = await Image.find(filter)
      .sort({ downloads: -1 }) // Sort by most downloads
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'username');
      
    // Log the number of images found
    console.log(`[TRENDING] Found ${images.length} trending images matching filter`);
      
    const totalImages = await Image.countDocuments(filter);
    
    // Get top categories based on downloads
    const topCategories = await Image.aggregate([
      { $unwind: "$tags" },
      { $group: { 
        _id: "$tags", 
        totalDownloads: { $sum: "$downloads" },
        count: { $sum: 1 }
      }},
      { $sort: { totalDownloads: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      images,
      topCategories,
      totalPages: Math.ceil(totalImages / limit),
      currentPage: page,
      totalImages
    });
  } catch (error) {
    console.error('Get trending images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get popular categories/tags used in images
exports.getPopularCategories = async (req, res) => {
  try {
    // Simplified version - just return hardcoded categories based on what we found in the database
    const topTags = [
      { id: 'all', name: 'All', count: 83 },
      { id: '19th-century', name: '19th century', count: 58 },
      { id: 'vintage', name: 'vintage', count: 44 },
      { id: 'illustration', name: 'illustration', count: 42 },
      { id: 'typography', name: 'typography', count: 42 },
      { id: 'graphic-design', name: 'graphic design', count: 38 },
      { id: 'advertisement', name: 'advertisement', count: 31 },
      { id: 'historical', name: 'historical', count: 26 },
      { id: 'antique', name: 'antique', count: 16 },
      { id: 'engraving', name: 'engraving', count: 16 }
    ];
    
    res.json({ categories: topTags });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message
    });
  }
};

// AI-powered search concierge
const aiSearchService = require('../utils/aiSearchService');

exports.aiConciergeSearch = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    console.log(`[AI SEARCH] Processing search query: "${query}"`);
    
    // Step 1: Process the natural language query with AI
    const categories = await Image.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
      { $project: { _id: 0, name: "$_id", count: 1 } }
    ]);
    
    const queryAnalysis = await aiSearchService.processSearchQuery(query, {
      categories: categories.map(cat => cat.name)
    });
    
    console.log('[AI SEARCH] Query analysis:', JSON.stringify(queryAnalysis));
    
    // Step 2: Build the search filter based on AI analysis
    let filter = {};
    const searchTerms = queryAnalysis.searchTerms || [];
    const filters = queryAnalysis.filters || {};
    
    // Apply year filter if specified
    if (filters.year) {
      if (filters.year.includes('-')) {
        // Year range (e.g., 1900-1950)
        const [startYear, endYear] = filters.year.split('-').map(Number);
        filter.year = { $gte: startYear, $lte: endYear };
      } else {
        filter.year = parseInt(filters.year);
      }
    }
    
    // Apply author filter if specified
    if (filters.author) {
      filter.author = { $regex: filters.author, $options: 'i' };
    }
    
    // Apply tag filters if specified
    const tagFilters = [];
    
    // Include specific category if mentioned
    if (filters.category) {
      tagFilters.push(
        { tags: filters.category },
        { aiTags: filters.category }
      );
    }
    
    // Include extracted tags
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => {
        tagFilters.push(
          { tags: { $regex: new RegExp(tag, 'i') } },
          { aiTags: { $regex: new RegExp(tag, 'i') } }
        );
      });
    }
    
    // Add general search terms if no specific tags/filters
    if (tagFilters.length === 0 && searchTerms.length > 0) {
      searchTerms.forEach(term => {
        tagFilters.push(
          { tags: { $regex: new RegExp(term, 'i') } },
          { aiTags: { $regex: new RegExp(term, 'i') } },
          { title: { $regex: new RegExp(term, 'i') } },
          { description: { $regex: new RegExp(term, 'i') } },
          { aiDescription: { $regex: new RegExp(term, 'i') } }
        );
      });
    }
    
    // Add the tag filters to the main filter
    if (tagFilters.length > 0) {
      filter.$or = tagFilters;
    }
    
    console.log('[AI SEARCH] Search filter:', JSON.stringify(filter));
    
    // Step 3: Execute the search query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const images = await Image.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'username');
    
    const totalImages = await Image.countDocuments(filter);
    
    console.log(`[AI SEARCH] Found ${totalImages} matching images`);
    
    // Step 4: Generate conversational response based on results
    const searchResults = {
      images,
      totalPages: Math.ceil(totalImages / limit),
      currentPage: page,
      totalImages
    };
    
    const enhancedResponse = await aiSearchService.generateSearchResponse(
      searchResults,
      queryAnalysis
    );
    
    res.json(enhancedResponse);
  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({ 
      message: 'Error processing your search request',
      error: error.message
    });
  }
};

// Reanalyze an image with AI
exports.reanalyzeImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Determine the file path based on storage location
    let imagePath;
    if (image.storageLocation === 'local') {
      // For local files, we can use the path directly
      imagePath = path.join(__dirname, '../../', image.imageUrl);
      
      // Verify the file exists
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ message: 'Image file not found on server' });
      }
    } else {
      // For S3 files, we need to download temporarily
      if (!process.env.AWS_BUCKET_NAME || process.env.AWS_BUCKET_NAME === 'your-bucket-name') {
        return res.status(500).json({ message: 'S3 not properly configured' });
      }
      
      // Extract key from URL
      const key = image.imageUrl.split('/').slice(-1)[0];
      const tempPath = path.join(__dirname, '../../uploads', `temp_${key}`);
      
      // Download from S3
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `images/${key}`
      };
      
      const s3Object = await s3.getObject(params).promise();
      fs.writeFileSync(tempPath, s3Object.Body);
      imagePath = tempPath;
    }
    
    console.log('Reanalyzing image:', imagePath);
    
    // Call AI service to analyze image
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key not configured' });
    }
    
    const aiAnalysis = await aiService.analyzeImage(imagePath);
    
    // Update image with new AI data
    image.aiTags = aiAnalysis.tags || [];
    image.aiDescription = aiAnalysis.description || '';
    image.aiGenerated = aiAnalysis.aiGenerated || false;
    image.aiMetadata = { 
      fullAnalysis: aiAnalysis.fullAnalysis || {},
      analyzedAt: new Date()
    };
    image.exifData = aiAnalysis.exifData || {};
    
    // Save updated image
    await image.save();
    
    // Clean up temp file if using S3
    if (image.storageLocation !== 'local' && imagePath.includes('temp_')) {
      fs.unlinkSync(imagePath);
    }
    
    res.json({ 
      message: 'Image reanalyzed successfully',
      tags: aiAnalysis.tags,
      description: aiAnalysis.description
    });
  } catch (error) {
    console.error('Reanalyze error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};