/**
 * Test script to directly check the categories endpoint
 */
require('dotenv').config();

async function main() {
  try {
    // Make a direct request to the categories endpoint
    console.log('Sending request to categories endpoint...');
    const response = await fetch('http://localhost:5001/api/images/categories');
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.error('Error response:', await response.text());
      return;
    }
    
    const data = await response.json();
    console.log('Categories data:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check specific items
    if (data.categories) {
      console.log(`\nFound ${data.categories.length} categories`);
      console.log('First 3 categories:');
      data.categories.slice(0, 3).forEach((cat, i) => {
        console.log(`${i+1}. ${cat.name} (id: ${cat.id}, count: ${cat.count})`);
      });
    } else {
      console.log('No categories found in response');
    }
  } catch (error) {
    console.error('Error making request:', error.message);
  }
}

main().catch(console.error);