/**
 * Batch Image Analysis Tool
 * 
 * This script analyzes all images in the database using the AI service
 * and updates their metadata with tags, descriptions, and other information.
 * 
 * Usage: node analyze-all-images.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define Image model schema inline to avoid requiring the whole app
const Image = mongoose.model('Image', new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  storageLocation: String,
  publicDomain: Boolean,
  year: Number,
  author: String,
  tags: [String],
  views: Number,
  likes: [mongoose.Schema.Types.ObjectId],
  uploadedBy: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
  aiGenerated: Boolean,
  aiDescription: String,
  aiTags: [String],
  aiMetadata: Object,
  exifData: Object
}));

// Import aiService
const aiService = require('./src/utils/aiService');

// Process all images
async function analyzeAllImages() {
  console.log('Starting batch analysis of all images...');
  
  // Get all images from database
  const images = await Image.find({});
  console.log(`Found ${images.length} images to analyze`);
  
  // Process each image
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    console.log(`\n[${i+1}/${images.length}] Analyzing image: ${image.title}`);
    
    try {
      // Skip images that already have AI tags if they have more than 5 tags
      if (image.aiTags && image.aiTags.length > 5 && image.aiDescription) {
        console.log('  Image already has AI analysis, skipping');
        continue;
      }
      
      // Get the file path
      let imagePath;
      if (image.storageLocation === 'local') {
        imagePath = path.join(__dirname, image.imageUrl);
        
        // Make sure the file exists
        if (!fs.existsSync(imagePath)) {
          console.log(`  Error: File not found at ${imagePath}`);
          continue;
        }
      } else {
        console.log('  Skipping S3-stored image (not supported in batch mode)');
        continue;
      }
      
      console.log(`  Analyzing file: ${imagePath}`);
      
      // Analyze the image
      const aiAnalysis = await aiService.analyzeImage(imagePath);
      
      // Update the image with AI data
      if (aiAnalysis.tags.length > 0 || aiAnalysis.description) {
        console.log(`  ✓ Analysis complete: ${aiAnalysis.tags.length} tags generated`);
        
        // Update the image in the database
        image.aiTags = aiAnalysis.tags || [];
        image.aiDescription = aiAnalysis.description || '';
        image.aiGenerated = aiAnalysis.aiGenerated || false;
        image.aiMetadata = { 
          fullAnalysis: aiAnalysis.fullAnalysis || {},
          analyzedAt: new Date()
        };
        image.exifData = aiAnalysis.exifData || {};
        
        await image.save();
        console.log('  ✓ Image updated in database');
      } else {
        console.log('  ✗ Analysis failed: No tags or description generated');
      }
    } catch (error) {
      console.error(`  ✗ Error analyzing image: ${error.message}`);
    }
  }
  
  console.log('\nBatch analysis complete!');
  mongoose.disconnect();
}

// Run the analysis
analyzeAllImages().catch(err => {
  console.error('Fatal error:', err);
  mongoose.disconnect();
  process.exit(1);
});