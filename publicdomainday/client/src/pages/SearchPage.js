import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import AIConciergeSearch from '../components/search/AIConciergeSearch';

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f9f9f9;
`;

const SearchHero = styled.div`
  background: linear-gradient(135deg, #0066cc, #003366);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto;
  opacity: 0.9;
  
  @media (min-width: 768px) {
    font-size: 1.3rem;
  }
`;

const ContentSection = styled.div`
  margin-top: -3rem;
  background: white;
  border-radius: 10px 10px 0 0;
  min-height: 600px;
  padding: 2rem;
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.05);
`;

const SearchPage = () => {
  const location = useLocation();
  const [initialQuery, setInitialQuery] = useState('');
  
  useEffect(() => {
    // Extract query parameter from URL if present
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('query');
    
    if (queryParam) {
      console.log('SearchPage detected query param:', queryParam);
      
      // Update the initial query to trigger a search
      setInitialQuery(queryParam);
      
      // Update document title with search query
      document.title = `Search: ${queryParam} - Public Domain Day`;
      
      // Force a search by dispatching an event (will be caught by AIConciergeSearch)
      const searchEvent = new CustomEvent('headerSearchSubmit', {
        detail: { query: queryParam }
      });
      window.dispatchEvent(searchEvent);
    }
  }, [location.search]);
  
  return (
    <PageContainer>
      <SearchHero>
        <HeroTitle>Intelligent Image Search</HeroTitle>
        <HeroSubtitle>
          Our AI concierge helps you find exactly what you're looking for with natural language understanding
        </HeroSubtitle>
      </SearchHero>
      
      <ContentSection>
        <AIConciergeSearch initialQuery={initialQuery} />
      </ContentSection>
    </PageContainer>
  );
};

export default SearchPage;