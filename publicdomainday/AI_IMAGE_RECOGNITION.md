# AI Image Recognition Integration Guide

This guide explains how to set up and use the AI image recognition features in PublicDomainDay.

## Features

- **Automatic Tag Generation**: Generate 15-20 relevant tags for each uploaded image
- **Intelligent Image Descriptions**: Create natural language descriptions of image content
- **Style, Theme & Subject Detection**: Identify artistic style, themes, and subjects
- **EXIF Data Extraction**: Extract and display camera metadata when available
- **AI Generation Detection**: Determine if an image was created by AI

## Setup Instructions

### 1. Install Required Dependencies

```bash
cd server
npm install openai exif-parser
```

### 2. Configure OpenAI API Key

1. Create an account at [OpenAI](https://platform.openai.com/) if you don't have one
2. Generate an API key from your account dashboard
3. Add your API key to the `.env` file:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Test the Integration

Use the provided test script to verify everything is working:

```bash
cd server/src/utils
node testAI.js path/to/test/image.jpg
```

This will generate a JSON file with the analysis results next to your image.

## Usage

### Automatic Analysis on Upload

Images are automatically analyzed when uploaded if an OpenAI API key is configured. The results include:

- 15-20 descriptive tags
- Natural language description
- Analysis of style, colors, themes, and subjects
- EXIF metadata (if available in the image)

### Manual Reanalysis

Admins can trigger reanalysis of images from the admin interface:

1. Navigate to Admin Dashboard
2. Click "Edit" on any image
3. In the "AI-Generated Information" section, click "Reanalyze"

### Working with AI Tags

In the edit interface, you can:

- Click individual AI-suggested tags to add/remove them
- Use "Add All Tags" to include all AI suggestions
- Use "Remove All" to remove all AI-suggested tags 
- Add your own custom tags in addition to AI suggestions

## Technical Notes

- Uses OpenAI's GPT-4 Vision model for high-quality image understanding
- Extracts EXIF metadata from images when available
- Supports both local storage and S3-hosted images
- Each analysis costs a small amount of OpenAI credits (approximately $0.01-0.03 per image)

## Troubleshooting

- **"OpenAI API key not configured"**: Make sure the API key is in your `.env` file
- **Analysis taking too long**: GPT-4 Vision can take 5-10 seconds per image
- **No tags generated**: Ensure the image is accessible and not corrupted

## Costs & Quotas

- OpenAI has rate limits for API usage
- Each image analysis costs approximately $0.01-0.03 
- New OpenAI accounts have usage caps that increase over time