/**
 * AI Image Recognition Test Script
 * 
 * This script tests the AI image analysis functionality by:
 * 1. Loading a sample image
 * 2. Sending it to the OpenAI Vision API
 * 3. Processing the results
 * 4. Displaying the generated tags and description
 * 
 * Usage:
 * OPENAI_API_KEY=your_key node testAI.js path/to/image.jpg
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const aiService = require('./aiService');

// Check for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is required');
  console.error('Usage: OPENAI_API_KEY=your_key node testAI.js path/to/image.jpg');
  process.exit(1);
}

// Get image path from command line argument
const imagePath = process.argv[2];
if (!imagePath) {
  console.error('Error: Please provide an image path');
  console.error('Usage: node testAI.js path/to/image.jpg');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(imagePath)) {
  console.error(`Error: File not found: ${imagePath}`);
  process.exit(1);
}

// Function to display AI analysis results
const displayResults = (results) => {
  console.log('\n=== AI Image Analysis Results ===\n');
  
  // Display basic info
  console.log('📝 Description:');
  console.log(results.description || 'No description generated');
  console.log();
  
  // Display tags
  console.log('🏷️  Tags:');
  if (results.tags && results.tags.length) {
    const tagGroups = [];
    for (let i = 0; i < results.tags.length; i += 5) {
      tagGroups.push(results.tags.slice(i, i + 5));
    }
    
    tagGroups.forEach(group => {
      console.log('  ' + group.map(tag => `#${tag}`).join(', '));
    });
  } else {
    console.log('  No tags generated');
  }
  console.log();
  
  // Display full analysis if available
  if (results.fullAnalysis) {
    console.log('🎨 Additional Analysis:');
    
    if (results.fullAnalysis.primaryColors) {
      console.log('  Colors:', results.fullAnalysis.primaryColors.join(', '));
    }
    
    if (results.fullAnalysis.subjects) {
      console.log('  Subjects:', results.fullAnalysis.subjects.join(', '));
    }
    
    if (results.fullAnalysis.themes) {
      console.log('  Themes:', results.fullAnalysis.themes.join(', '));
    }
    
    if (results.fullAnalysis.style) {
      console.log('  Style:', results.fullAnalysis.style);
    }
    
    if (results.fullAnalysis.medium) {
      console.log('  Medium:', results.fullAnalysis.medium);
    }
    
    console.log('  AI Generated:', results.aiGenerated ? 'Yes' : 'No');
    console.log();
  }
  
  // Display EXIF data if available
  if (results.exifData && Object.keys(results.exifData).length) {
    console.log('📷 EXIF Data:');
    for (const [key, value] of Object.entries(results.exifData)) {
      if (key !== 'location') {
        console.log(`  ${key}: ${value}`);
      }
    }
    console.log();
  }
};

// Main function
const main = async () => {
  console.log(`Analyzing image: ${imagePath}`);
  console.log('This may take a few moments...');
  
  try {
    // Call the AI service to analyze the image
    const results = await aiService.analyzeImage(imagePath);
    
    // Display the results
    displayResults(results);
    
    // Save results to a JSON file for reference
    const outputPath = path.join(
      path.dirname(imagePath), 
      `${path.basename(imagePath, path.extname(imagePath))}_analysis.json`
    );
    
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Analysis saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error during image analysis:', error);
  }
};

// Run the main function
main();