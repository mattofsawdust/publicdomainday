/**
 * AI Search Service for PublicDomainDay
 * 
 * This service powers the AI concierge search functionality:
 * - Processes natural language search queries
 * - Extracts relevant search terms and filters
 * - Suggests refinements to improve search results
 * - Provides conversational guidance to users
 * 
 * Uses OpenAI's API for natural language understanding
 */

const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Process a natural language search query and extract structured search parameters
 * @param {string} query - The user's natural language search query
 * @param {Object} context - Optional context about the current search state
 * @returns {Object} - Structured search parameters and conversational response
 */
const processSearchQuery = async (query, context = {}) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Define the current state of available tags and categories for context
    const availableCategories = context.categories || [
      '19th century', 'vintage', 'illustration', 'typography', 
      'graphic design', 'advertisement', 'historical', 'antique', 
      'engraving', 'poster', 'architecture', 'portrait', 'landscape',
      'nature', 'animals', 'people', 'urban', 'rural', 'industrial',
      'transportation', 'fashion', 'music', 'art', 'science', 'technology'
    ];

    // Create a prompt that helps the model understand how to parse the query
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert image search assistant for a public domain image collection.
          Your task is to help users find the perfect images by understanding their natural language queries.
          
          Available image categories in our system: ${availableCategories.join(', ')}
          
          For each user query:
          1. Extract key search terms (subjects, styles, colors, themes, etc.)
          2. Identify any filters (time period, artist, medium, etc.)
          3. Provide conversational guidance to help refine their search
          4. Suggest additional related terms they might want to consider
          
          Respond with a JSON object with the following structure:
          {
            "searchTerms": ["term1", "term2", ...],
            "filters": {
              "year": "YYYY or range YYYY-YYYY" (if specified),
              "author": "author name" (if specified),
              "category": "category name" (if it matches available categories),
              "tags": ["tag1", "tag2", ...] (extracted from query)
            },
            "conversationalResponse": "Your helpful response to the user",
            "suggestedRefinements": ["suggestion1", "suggestion2", ...]
          }`
        },
        {
          role: "user",
          content: `Please analyze this search query and help me find the right images: "${query}"`
        }
      ],
      max_tokens: 500
    });

    // Extract and parse the JSON response
    const content = response.choices[0].message.content;
    let searchResult;
    
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*?}/);
                        
      const jsonString = jsonMatch 
        ? jsonMatch[1] || jsonMatch[0]
        : content;
        
      searchResult = JSON.parse(jsonString.replace(/^```json|```$/g, '').trim());
    } catch (parseError) {
      console.error('Error parsing AI search response:', parseError);
      console.log('Raw response:', content);
      
      // Fallback with basic extraction
      searchResult = {
        searchTerms: [query],
        filters: {},
        conversationalResponse: "I'll help you find images related to your search.",
        suggestedRefinements: []
      };
    }
    
    return searchResult;
    
  } catch (error) {
    console.error('AI search processing error:', error);
    return {
      searchTerms: [query],
      filters: {},
      conversationalResponse: "I'm having trouble processing your search. Let me find some relevant images for you.",
      suggestedRefinements: [],
      error: error.message
    };
  }
};

/**
 * Generate a conversational response based on search results
 * @param {Object} searchResults - The results of the image search
 * @param {Object} queryAnalysis - The AI analysis of the original query
 * @returns {Object} - Enhanced response with conversational guidance
 */
const generateSearchResponse = async (searchResults, queryAnalysis) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Extract relevant info from search results
    const { totalImages, images } = searchResults;
    
    // Prepare context about the images found
    const imageInfoSample = images.slice(0, 5).map(img => ({
      title: img.title,
      tags: [...(img.tags || []), ...(img.aiTags || [])].join(', '),
      year: img.year,
      author: img.author
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert image search concierge for a public domain image collection.
          Your task is to provide helpful, conversational guidance based on search results.
          
          Be concise but friendly. Focus on:
          1. Summarizing what was found (or not found)
          2. Highlighting notable images in the results
          3. Suggesting ways to refine the search if needed
          4. Connecting results to the user's original intent
          
          Don't repeat tags verbatim. Synthesize the information into natural language.
          Keep your response under 100 words.`
        },
        {
          role: "user",
          content: JSON.stringify({
            originalQuery: queryAnalysis.searchTerms.join(' '),
            suggestedRefinements: queryAnalysis.suggestedRefinements,
            totalResults: totalImages,
            sampleResults: imageInfoSample
          })
        }
      ],
      max_tokens: 200
    });

    // Return the conversational response
    const aiResponse = response.choices[0].message.content;
    
    return {
      ...searchResults,
      aiConciergeResponse: aiResponse,
      suggestedRefinements: queryAnalysis.suggestedRefinements
    };
    
  } catch (error) {
    console.error('AI response generation error:', error);
    return {
      ...searchResults,
      aiConciergeResponse: totalImages > 0 
        ? `I found ${totalImages} images that might match what you're looking for.` 
        : "I couldn't find any images matching your search. Try different keywords?",
      error: error.message
    };
  }
};

module.exports = {
  processSearchQuery,
  generateSearchResponse
};