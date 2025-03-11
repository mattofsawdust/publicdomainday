/**
 * Diagnostic script for AI image analysis integration
 * 
 * This script checks:
 * 1. If the OpenAI API key is properly configured
 * 2. If the aiService.js file exists and is properly formatted
 * 3. If the image controller properly imports and uses aiService
 * 4. Tests a sample image analysis
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Colors for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BLUE = '\x1b[34m';

function log(message, color = RESET) {
  console.log(color + message + RESET);
}

function checkPaths() {
  log('\n=== Checking file paths ===', BLUE);
  
  const aiServicePath = path.join(__dirname, 'src', 'utils', 'aiService.js');
  const imageControllerPath = path.join(__dirname, 'src', 'controllers', 'imageController.js');
  
  if (fs.existsSync(aiServicePath)) {
    log(`✓ aiService.js found at ${aiServicePath}`, GREEN);
  } else {
    log(`✗ aiService.js NOT found at ${aiServicePath}`, RED);
    log('  Please make sure the file exists at this location', YELLOW);
  }
  
  if (fs.existsSync(imageControllerPath)) {
    log(`✓ imageController.js found at ${imageControllerPath}`, GREEN);
    
    // Check if imageController references aiService
    const imageControllerContent = fs.readFileSync(imageControllerPath, 'utf8');
    if (imageControllerContent.includes('aiService.analyzeImage')) {
      log('✓ imageController.js references aiService.analyzeImage', GREEN);
    } else {
      log('✗ imageController.js does not reference aiService.analyzeImage', RED);
    }
  } else {
    log(`✗ imageController.js NOT found at ${imageControllerPath}`, RED);
  }
}

function checkOpenAIKey() {
  log('\n=== Checking OpenAI API key ===', BLUE);
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    log('✗ OPENAI_API_KEY not found in environment variables', RED);
    return false;
  }
  
  if (apiKey.startsWith('sk-')) {
    log(`✓ OPENAI_API_KEY found: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`, GREEN);
    return true;
  } else {
    log(`✗ OPENAI_API_KEY has invalid format: ${apiKey.substring(0, 6)}...`, RED);
    return false;
  }
}

function testImageAnalysis() {
  log('\n=== Testing image analysis with sample image ===', BLUE);
  
  // Find a sample image to test with
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    log(`✗ Uploads directory not found at ${uploadsDir}`, RED);
    return;
  }
  
  // Get all files in uploads directory
  const files = fs.readdirSync(uploadsDir);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
  });
  
  if (imageFiles.length === 0) {
    log('✗ No image files found in uploads directory', RED);
    return;
  }
  
  // Choose the first image file
  const testImagePath = path.join(uploadsDir, imageFiles[0]);
  log(`Using test image: ${testImagePath}`, YELLOW);
  
  try {
    // Import the aiService
    const aiService = require('./src/utils/aiService');
    
    // Test the analyzeImage function
    log('Analyzing image - this may take a few seconds...', YELLOW);
    aiService.analyzeImage(testImagePath)
      .then(result => {
        log('✓ Image analysis completed successfully', GREEN);
        log('\nAI Analysis Results:', BLUE);
        log(`Description: ${result.description || 'None'}`);
        log(`Tags (${result.tags.length}): ${result.tags.join(', ')}`);
        log(`AI Generated: ${result.aiGenerated}`);
        log('\nIf you see tags and a description above, the AI analysis is working correctly!', GREEN);
      })
      .catch(err => {
        log(`✗ Image analysis failed: ${err.message}`, RED);
        console.error(err);
      });
  } catch (err) {
    log(`✗ Failed to import aiService: ${err.message}`, RED);
    console.error(err);
  }
}

function checkDependencies() {
  log('\n=== Checking dependencies ===', BLUE);
  
  // Check if OpenAI package is installed
  exec('npm list openai', (error, stdout, stderr) => {
    if (stdout.includes('openai@')) {
      log('✓ OpenAI package is installed', GREEN);
    } else {
      log('✗ OpenAI package is NOT installed - you should run "npm install openai"', RED);
    }
    
    // Check if exif-parser package is installed
    exec('npm list exif-parser', (error, stdout, stderr) => {
      if (stdout.includes('exif-parser@')) {
        log('✓ exif-parser package is installed', GREEN);
      } else {
        log('✗ exif-parser package is NOT installed - you should run "npm install exif-parser"', RED);
      }
      
      // Continue with image analysis test
      testImageAnalysis();
    });
  });
}

// Main execution
function main() {
  log('===== AI Integration Diagnostic Tool =====', BLUE);
  log('This tool will diagnose issues with the AI image analysis functionality', YELLOW);
  
  checkPaths();
  const hasValidKey = checkOpenAIKey();
  checkDependencies();
  
  if (!hasValidKey) {
    log('\n⚠️  OpenAI API key is missing or invalid - AI image analysis will not work!', RED);
    log('Make sure to add a valid OpenAI API key to your .env file:', YELLOW);
    log('OPENAI_API_KEY=sk-xxxx...', YELLOW);
  }
}

main();