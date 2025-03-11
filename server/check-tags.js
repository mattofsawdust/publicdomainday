/**
 * Script to check if images with specific tags exist
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Image = require('./src/models/Image');

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check specific tag
    const tagToCheck = 'graphic design';
    const graphicDesignImages = await Image.countDocuments({ tags: tagToCheck });
    console.log(`Images with '${tagToCheck}' tag: ${graphicDesignImages}`);

    const aiGraphicDesignImages = await Image.countDocuments({ aiTags: tagToCheck });
    console.log(`Images with '${tagToCheck}' AI tag: ${aiGraphicDesignImages}`);

    // Check case issues
    const graphicDesignCaseInsensitive = await Image.countDocuments({ 
      $or: [
        { tags: new RegExp(tagToCheck, 'i') },
        { aiTags: new RegExp(tagToCheck, 'i') }
      ]
    });
    console.log(`Images with '${tagToCheck}' tag (case insensitive): ${graphicDesignCaseInsensitive}`);

    // Check similar tags
    const similarTags = ['design', 'graphic', 'graphics'];
    for (const tag of similarTags) {
      const count = await Image.countDocuments({ 
        $or: [
          { tags: new RegExp(tag, 'i') },
          { aiTags: new RegExp(tag, 'i') }
        ]
      });
      console.log(`Images with '${tag}' tag (case insensitive): ${count}`);
    }

    // Get a sample of tags for debugging
    const sampleImages = await Image.find().limit(3);
    console.log('\nSample image tags:');
    sampleImages.forEach((img, i) => {
      console.log(`Image ${i+1} - Tags: ${JSON.stringify(img.tags)}`);
      console.log(`Image ${i+1} - AI Tags: ${JSON.stringify(img.aiTags)}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

main().catch(console.error);