// Simple test script to verify OpenAI API key
require('dotenv').config();
const { OpenAI } = require('openai');

// Retrieve API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

// Output API key information (abbreviated for security)
if (apiKey) {
  console.log(`Found OpenAI API key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
} else {
  console.error('No OpenAI API key found in environment variables!');
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey
});

// Simple test to verify API key works
async function testOpenAI() {
  try {
    console.log('Attempting to call OpenAI API...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a helpful assistant."},
        {role: "user", content: "Hello, OpenAI!"}
      ],
      max_tokens: 50
    });
    
    console.log('API call successful!');
    console.log('Response:', completion.choices[0].message.content);
    
    return true;
  } catch (error) {
    console.error('API call failed:', error.message);
    console.error('Error details:', error);
    
    return false;
  }
}

testOpenAI().then(success => {
  if (success) {
    console.log('OpenAI API key is valid and working!');
  } else {
    console.error('OpenAI API key seems to be invalid or expired.');
  }
});