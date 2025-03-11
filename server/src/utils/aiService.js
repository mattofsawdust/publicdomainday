/**
 * AI Service for PublicDomainDay
 * 
 * This service handles AI-powered image analysis including:
 * - Generating descriptive keywords/tags for images
 * - Creating natural language descriptions of image content
 * - Extracting themes, subjects, colors, and other metadata
 * - Determining if an image appears to be AI-generated
 * 
 * Uses OpenAI's Vision API for high-quality image understanding
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const ExifParser = require('exif-parser');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Extracts EXIF metadata from an image if available
 * @param {string} imagePath - Path to the image file
 * @returns {Object} - Extracted EXIF data or empty object if none
 */
const extractExifData = (imagePath) => {
  try {
    // Only try to extract EXIF from JPEG/JPG files
    const fileExtension = path.extname(imagePath).toLowerCase();
    if (!['.jpg', '.jpeg'].includes(fileExtension)) {
      // Skip EXIF extraction for non-JPEG files
      return {};
    }
    
    const buffer = fs.readFileSync(imagePath);
    const parser = ExifParser.create(buffer);
    const result = parser.parse();
    
    // Extract useful EXIF data
    const exifData = {};
    
    if (result.tags) {
      // Camera info
      if (result.tags.Make) exifData.make = result.tags.Make;
      if (result.tags.Model) exifData.model = result.tags.Model;
      
      // Date taken
      if (result.tags.DateTimeOriginal) {
        const date = new Date(result.tags.DateTimeOriginal * 1000);
        exifData.dateTaken = date.toISOString();
      }
      
      // Camera settings
      if (result.tags.FNumber) exifData.aperture = `f/${result.tags.FNumber.toFixed(1)}`;
      if (result.tags.ExposureTime) {
        const exposureTime = result.tags.ExposureTime;
        exifData.shutterSpeed = exposureTime >= 1 
          ? `${exposureTime}s` 
          : `1/${Math.round(1/exposureTime)}s`;
      }
      if (result.tags.ISO) exifData.iso = result.tags.ISO;
      if (result.tags.FocalLength) exifData.focalLength = `${result.tags.FocalLength}mm`;
      
      // GPS data - be careful with privacy
      if (result.tags.GPSLatitude && result.tags.GPSLongitude) {
        exifData.location = {
          latitude: result.tags.GPSLatitude,
          longitude: result.tags.GPSLongitude
        };
      }
    }
    
    return exifData;
  } catch (error) {
    console.log('EXIF extraction error:', error);
    return {};
  }
};

/**
 * Analyzes an image using OpenAI's Vision API
 * @param {string} imagePath - Path to the image file
 * @returns {Object} - Analysis results including tags, description, and metadata
 */
const analyzeImage = async (imagePath) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Read the image file as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Extract EXIF data
    const exifData = extractExifData(imagePath);
    
    // Analyze with OpenAI Vision (using the latest model)
    const response = await openai.chat.completions.create({
      model: "gpt-4o",  // Updated from deprecated gpt-4-vision-preview
      messages: [
        {
          role: "system",
          content: `You are an expert art historian and image analyst. 
          Your task is to analyze the provided image and extract the following information:
          
          1. Create a list of 15-20 specific, relevant keywords/tags that describe the image content
          2. Write a concise but detailed description of the image (2-3 sentences)
          3. Determine if this image appears to be AI-generated (look for telltale signs)
          4. Identify primary colors, subjects, themes, style, and medium
          
          Focus on being precise and factual. Include relevant details about the subject matter, style, 
          composition, era, emotions, and other important aspects. Be especially thorough with the tags, 
          as these will be used for search functionality.
          
          Respond with a JSON object with the following structure:
          {
            "tags": ["tag1", "tag2", "tag3", ...],
            "description": "Detailed description here",
            "aiGenerated": true/false,
            "primaryColors": ["color1", "color2", ...],
            "subjects": ["subject1", "subject2", ...],
            "themes": ["theme1", "theme2", ...],
            "style": "artistic style if applicable",
            "medium": "artistic medium if applicable"
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze the following image comprehensively. Pay special attention to creating a diverse and specific set of 15-20 keywords that could be used to find this image in a search."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 800
    });

    // Extract and parse the JSON response
    const content = response.choices[0].message.content;
    let analysisResult;
    
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*?}/);
                        
      const jsonString = jsonMatch 
        ? jsonMatch[1] || jsonMatch[0]
        : content;
        
      analysisResult = JSON.parse(jsonString.replace(/^```json|```$/g, '').trim());
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw response:', content);
      
      // Fallback: extract tags and description manually with regex
      const tags = content.match(/tags["']?\s*:\s*\[(.*?)\]/s);
      const description = content.match(/description["']?\s*:\s*["'](.+?)["']/s);
      
      analysisResult = {
        tags: tags ? tags[1].split(/["']\s*,\s*["']/).map(tag => tag.replace(/["']/g, '').trim()) : [],
        description: description ? description[1] : '',
        aiGenerated: content.toLowerCase().includes('aigenerated') && content.toLowerCase().includes('true'),
      };
    }
    
    return {
      tags: analysisResult.tags || [],
      description: analysisResult.description || '',
      aiGenerated: analysisResult.aiGenerated || false,
      fullAnalysis: analysisResult,
      exifData
    };
    
  } catch (error) {
    console.error('AI image analysis error:', error);
    return {
      tags: [],
      description: '',
      aiGenerated: false,
      error: error.message
    };
  }
};

module.exports = {
  analyzeImage
};