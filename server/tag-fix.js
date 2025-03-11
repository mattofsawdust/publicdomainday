/**
 * Script to test a tag search on images
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Image = require('./src/models/Image');

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test different tag search approaches
    const tagToSearch = "graphic design";
    
    // Method 1: Simple equals
    const method1 = await Image.countDocuments({ tags: tagToSearch });
    console.log(`Method 1 (exact match): ${method1} images`);
    
    // Method 2: Using $in with an array
    const method2 = await Image.countDocuments({ tags: { $in: [tagToSearch] } });
    console.log(`Method 2 (array $in): ${method2} images`);
    
    // Method 3: Using regex with exact pattern
    const method3 = await Image.countDocuments({ tags: new RegExp('^' + tagToSearch + '$', 'i') });
    console.log(`Method 3 (regex exact): ${method3} images`);
    
    // Method 4: Using regex with partial match
    const method4 = await Image.countDocuments({ tags: new RegExp(tagToSearch, 'i') });
    console.log(`Method 4 (regex partial): ${method4} images`);

    // Method 5: Combined methods
    const method5 = await Image.countDocuments({
      $or: [
        { tags: tagToSearch },
        { aiTags: tagToSearch },
        { tags: new RegExp('^' + tagToSearch + '$', 'i') },
        { aiTags: new RegExp('^' + tagToSearch + '$', 'i') }
      ]
    });
    console.log(`Method 5 (combined): ${method5} images`);
    
    // Show some example images with the tag
    const sampleImages = await Image.find({ 
      $or: [
        { tags: tagToSearch },
        { aiTags: tagToSearch }
      ]
    }).limit(3);

    console.log('\nSample images with tag:');
    sampleImages.forEach((img, i) => {
      console.log(`${i+1}. ${img.title} - Tags: ${img.tags.join(', ')}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

main().catch(console.error);