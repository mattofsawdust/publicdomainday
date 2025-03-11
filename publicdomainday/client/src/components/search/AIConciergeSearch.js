import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaRobot, FaSpinner, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { aiConciergeSearch } from '../../utils/api';
import ImageGrid from '../images/ImageGrid';

const ConciergeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const SearchHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 800px;
  margin: 2rem auto;
  display: flex;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const SearchInput = styled.input.attrs({
  autoComplete: 'off', // Prevent browser autocomplete from interfering
  spellCheck: 'false' // Prevent spell checking
})`
  width: 100%;
  padding: 1.2rem 5rem 1.2rem 3rem; /* Further increased right padding for repositioned clear button */
  border: none;
  font-size: 1.1rem;
  border-radius: 8px 0 0 8px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #0066cc;
  }
`;

const SearchButton = styled.button`
  background: #0066cc;
  color: white;
  border: none;
  padding: 0 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  
  &:hover {
    background: #0055aa;
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
`;

const ClearButton = styled.button.attrs({
  // Set button type explicitly to prevent form submission
  type: 'button',
  tabIndex: '0'
})`
  position: absolute;
  right: 8.5rem; /* Moved even further left for better spacing */
  top: 50%;
  transform: translateY(-50%);
  background: #f2f2f2; /* Light gray background for better visibility */
  border: none;
  color: #666;
  cursor: pointer;
  display: ${props => props.show ? 'flex' : 'none'};
  outline: none; /* Remove outline on focus */
  z-index: 10; /* Ensure button is clickable */
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%; /* Make it circular */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); /* Add subtle shadow for depth */
  
  &:hover {
    background: #e0e0e0;
    color: #333;
  }
  
  &:focus {
    outline: none;
  }
`;

const ResponseContainer = styled.div`
  position: relative;
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: ${props => props.show ? 'block' : 'none'};
`;

const BotIcon = styled.div`
  position: absolute;
  top: -20px;
  left: 20px;
  width: 40px;
  height: 40px;
  background: #0066cc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const ResponseText = styled.p`
  margin: 0;
  color: #333;
  line-height: 1.6;
`;

const SuggestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const SuggestionTag = styled.button`
  background: #e6f2ff;
  color: #0066cc;
  border: 1px solid #cce5ff;
  border-radius: 20px;
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #cce5ff;
    transform: translateY(-1px);
  }
`;

const ResultsContainer = styled.div`
  margin-top: 3rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ResultsCount = styled.div`
  font-size: 1.1rem;
  color: #666;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  opacity: ${props => props.show ? 1 : 0};
  transition: all 0.3s;
`;

const SpinnerIcon = styled(FaSpinner)`
  font-size: 3rem;
  color: #0066cc;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  color: #333;
  font-size: 1.2rem;
`;

const AIConciergeSearch = ({ initialQuery = '' }) => {
  // Initialize state with initialQuery if available
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [isSearching, setIsSearching] = useState(initialQuery ? true : false); // Start loading if initialQuery exists
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  
  // Execute immediate search when component mounts if initialQuery is provided
  useEffect(() => {
    if (initialQuery) {
      console.log('Initial mount with query, executing immediate search:', initialQuery);
      aiConciergeSearch(initialQuery)
        .then(response => {
          console.log('Initial search results:', response.data);
          setSearchResults(response.data);
          setIsSearching(false);
        })
        .catch(err => {
          console.error('Initial search failed:', err);
          setError('Sorry, I encountered an issue processing your search.');
          setIsSearching(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleSearch = async (e) => {
    // Prevent default form submission behavior if called from an event
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Don't proceed if search query is empty
    if (!searchQuery || !searchQuery.trim()) {
      return;
    }
    
    console.log('Performing search for:', searchQuery);
    
    // Update URL with search query (without triggering a reload)
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.get('query') !== searchQuery) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`, { replace: true });
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await aiConciergeSearch(searchQuery);
      console.log('AI Concierge search results:', response.data);
      setSearchResults(response.data);
    } catch (err) {
      console.error('AI Concierge search failed:', err);
      setError('Sorry, I encountered an issue processing your search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    // Manually trigger search after setting the suggestion
    setTimeout(() => handleSearch(), 50);
  };
  
  const clearSearch = (e) => {
    // Prevent any form submission or bubbling to parent form
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Clear the search query and results
    setSearchQuery('');
    setSearchResults(null);
    
    // Update URL to remove query parameter
    navigate('/search', { replace: true });
    
    // Focus the input field after clearing
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };
  
  // Update the search query and run search when initialQuery prop changes
  useEffect(() => {
    if (initialQuery) {
      console.log('Initial query detected:', initialQuery);
      setSearchQuery(initialQuery);
      
      // Always perform a search when initialQuery is provided or changed
      // This ensures search results load immediately
      console.log('Performing search with initial query');
      // Use setTimeout to ensure state is updated before search runs
      setTimeout(() => handleSearch(), 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);
  
  // Focus the search input when the component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    
    // Listen for header search events
    const handleHeaderSearch = (event) => {
      console.log('Received header search event:', event.detail);
      if (event.detail && event.detail.query) {
        // Set the query and immediately perform a search
        setSearchQuery(event.detail.query);
        
        // Use a small timeout to ensure the state is updated before searching
        setTimeout(() => {
          console.log('Performing search from header event with query:', event.detail.query);
          // Call handleSearch directly with the query to ensure it runs immediately
          aiConciergeSearch(event.detail.query)
            .then(response => {
              console.log('Search results from event:', response.data);
              setSearchResults(response.data);
              setIsSearching(false);
            })
            .catch(err => {
              console.error('Search failed:', err);
              setError('Sorry, I encountered an issue processing your search.');
              setIsSearching(false);
            });
          
          setIsSearching(true);
        }, 50);
      }
    };
    
    window.addEventListener('headerSearchSubmit', handleHeaderSearch);
    
    return () => {
      window.removeEventListener('headerSearchSubmit', handleHeaderSearch);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // We're no longer auto-searching when the query changes
  // This prevents searches from happening on each keystroke
  // Instead, users must explicitly submit the form or press Enter
  
  return (
    <ConciergeContainer>
      <SearchHeader>
        <Title>
          <FaRobot /> AI Image Concierge
        </Title>
        <Subtitle>
          Ask me anything about public domain images. Try phrases like "Show me vintage advertisements with animals" or "Find illustrations from the early 1900s"
        </Subtitle>
      </SearchHeader>
      
      <form onSubmit={handleSearch} data-testid="search-form">
        <SearchContainer>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Describe what kind of images you're looking for..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            ref={searchInputRef}
            onKeyDown={(e) => {
              // Only trigger search on Enter key
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
              // For all other keys (like Backspace), just let normal typing behavior work
            }}
          />
          <ClearButton 
            onClick={(e) => {
              // Stop propagation at all levels to prevent form submission
              e.preventDefault();
              e.stopPropagation();
              clearSearch();
              return false;
            }}
            show={searchQuery.length > 0}
            aria-label="Clear search"
            title="Clear search"
          >
            <FaTimes size={14} />
          </ClearButton>
          <SearchButton 
            type="submit" 
            disabled={isSearching || !searchQuery.trim()}
            aria-label="Search"
          >
            {isSearching ? <FaSpinner /> : <FaPaperPlane />}
            Search
          </SearchButton>
        </SearchContainer>
      </form>
      
      {searchResults && (
        <>
          <ResponseContainer show={searchResults?.aiConciergeResponse}>
            <BotIcon>
              <FaRobot />
            </BotIcon>
            <ResponseText>
              {searchResults.aiConciergeResponse || "I found some images that might match what you're looking for."}
            </ResponseText>
            
            {searchResults.suggestedRefinements && searchResults.suggestedRefinements.length > 0 && (
              <SuggestionsContainer>
                <small style={{ color: '#666', marginRight: '0.5rem' }}>Try:</small>
                {searchResults.suggestedRefinements.map((suggestion, index) => (
                  <SuggestionTag 
                    key={index} 
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </SuggestionTag>
                ))}
              </SuggestionsContainer>
            )}
          </ResponseContainer>
          
          <ResultsContainer>
            <ResultsHeader>
              <ResultsCount>
                {searchResults.totalImages} {searchResults.totalImages === 1 ? 'image' : 'images'} found
              </ResultsCount>
            </ResultsHeader>
            
            {searchResults.images && searchResults.images.length > 0 ? (
              <ImageGrid images={searchResults.images} />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                <p>No images found matching your search.</p>
                <p>Try different keywords or one of the suggested refinements.</p>
              </div>
            )}
          </ResultsContainer>
        </>
      )}
      
      {error && (
        <div style={{ textAlign: 'center', color: '#d9534f', margin: '2rem 0' }}>
          {error}
        </div>
      )}
      
      <LoadingOverlay show={isSearching}>
        <SpinnerIcon />
        <LoadingText>
          Analyzing your query and searching for the perfect images...
        </LoadingText>
      </LoadingOverlay>
    </ConciergeContainer>
  );
};

export default AIConciergeSearch;