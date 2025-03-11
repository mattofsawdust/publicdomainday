import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const TestContainer = styled.div`
  margin: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: 500px;
`;

const Button = styled.button`
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  
  &:hover {
    background-color: #0055aa;
  }
`;

const ResultDisplay = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: ${props => props.error ? '#ffeeee' : '#eeffee'};
  color: ${props => props.error ? '#cc0000' : '#00cc00'};
`;

const CorsTest = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const testCors = async () => {
    try {
      setError(null);
      console.log('Testing CORS connection...');
      // Use plain axios with relative URL (will use proxy)
      const response = await axios.get('/api/test-cors', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('CORS test response:', response);
      setResult(response.data);
    } catch (err) {
      console.error('CORS test failed:', err);
      setError(err.message || 'CORS test failed');
    }
  };
  
  return (
    <TestContainer>
      <h3>CORS Test</h3>
      <Button onClick={testCors}>Test CORS Connection</Button>
      
      {result && (
        <ResultDisplay>
          Success: {JSON.stringify(result)}
        </ResultDisplay>
      )}
      
      {error && (
        <ResultDisplay error>
          Error: {error}
        </ResultDisplay>
      )}
    </TestContainer>
  );
};

export default CorsTest;