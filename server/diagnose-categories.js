/**
 * Diagnostic script to check the categories in the database
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Image = require('./src/models/Image');

async function main() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if we have any images
    const imageCount = await Image.countDocuments();
    console.log(`Total images in database: ${imageCount}`);

    // Check tags
    const tagsResult = await Image.aggregate([
      { $unwind: { path: "$tags", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    console.log('\nUser-defined tags:');
    console.log(tagsResult.length ? tagsResult : 'No user-defined tags found');

    // Check AI tags
    const aiTagsResult = await Image.aggregate([
      { $unwind: { path: "$aiTags", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$aiTags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    console.log('\nAI-generated tags:');
    console.log(aiTagsResult.length ? aiTagsResult : 'No AI-generated tags found');

    // Get a sample of images to check their structure
    const sampleImages = await Image.find().limit(2).lean();
    
    if (sampleImages.length > 0) {
      console.log('\nSample image structure:');
      const image = sampleImages[0];
      console.log(`ID: ${image._id}`);
      console.log(`Title: ${image.title}`);
      console.log(`Tags array:`, image.tags);
      console.log(`AI Tags array:`, image.aiTags);
      console.log(`Downloads: ${image.downloads || 0}`);
    } else {
      console.log('\nNo images found to sample');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

main().catch(console.error);