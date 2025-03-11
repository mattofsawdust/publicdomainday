import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getAllImages, getCategories } from '../utils/api';
import ImageGrid from '../components/images/ImageGrid';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PageContainer = styled.div`
  min-height: 100vh;
`;

const TagResultsTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  h2 {
    font-size: 1.8rem;
    margin: 0;
    color: #333;
  }
  
  .tag {
    background-color: #0066cc;
    color: white;
    padding: 0.3rem 0.8rem;
    border-radius: 4px;
    font-size: 1.1rem;
  }
  
  .count {
    color: #666;
    font-size: 1.1rem;
  }
`;


const ContentSection = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const CategoryTabs = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }
`;

const CategoryTab = styled.button`
  background: ${props => props.$active ? '#0066cc' : '#f0f0f0'};
  color: ${props => props.$active ? 'white' : '#333'};
  border: none;
  border-radius: 20px;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &:hover {
    background: ${props => props.$active ? '#0055aa' : '#e0e0e0'};
  }
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 3rem auto 0;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0055aa;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All' } // Default entry until we load real categories
  ]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const fetchImages = async (reset = false, tagParam = null) => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params = {
        page: reset ? 1 : page,
        limit: 20
      };
      
      // If a tag parameter is provided (from URL), use it exactly as is
      if (tagParam) {
        params.tag = tagParam;
        // Always ensure we reset when searching by tag
        if (!reset) {
          reset = true;
          console.log(`Forcing reset for tag search`);
        }
        console.log(`Filtering by tag parameter (exact match): "${tagParam}"`);
      }
      // Otherwise, add search query if exists
      else if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      // Otherwise, add category filter if not 'all'
      else if (activeCategory !== 'all') {
        // Get the original name from the categories array (preserves spaces and case)
        const selectedCategory = categories.find(cat => cat.id === activeCategory);
        if (selectedCategory) {
          params.tag = selectedCategory.name; // Use the original name with proper spacing
          console.log(`Filtering by tag (from category): "${selectedCategory.name}"`);
        } else {
          params.tag = activeCategory;
          console.log(`Filtering by tag ID: "${activeCategory}"`);
        }
      }
      
      const response = await getAllImages(params);
      
      // Debug response
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log(`Fetched ${response.data.images ? response.data.images.length : 0} images, total: ${response.data.totalImages || 0}`);
      
      if (response.data.images && response.data.images.length > 0) {
        // Log details of the first image to help diagnose issues
        const firstImage = response.data.images[0];
        console.log('First image details:', {
          id: firstImage._id,
          title: firstImage.title,
          imageUrl: firstImage.imageUrl,
          fullImagePath: firstImage.imageUrl.startsWith('http') ? 
            firstImage.imageUrl : 
            `http://localhost:5001${firstImage.imageUrl}`
        });
      }
      
      if (activeCategory !== 'all') {
        // Check tags on returned images
        const selectedCategoryName = categories.find(cat => cat.id === activeCategory)?.name;
        if (selectedCategoryName) {
          console.log(`Checking returned images for tag: "${selectedCategoryName}"`);
          
          // Log first 2 images' tags for debugging
          response.data.images.slice(0, 2).forEach((img, i) => {
            console.log(`Image ${i+1} tags:`, img.tags);
          });
        }
      }
      
      if (reset) {
        setImages(response.data.images);
      } else {
        setImages(prev => [...prev, ...response.data.images]);
      }
      
      // Check if there are more images to load
      setHasMore(response.data.currentPage < response.data.totalPages);
      
      // Update the page for next load
      if (!reset) {
        setPage(prev => prev + 1);
      } else {
        setPage(2);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch images:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      console.error('Error status:', err.response ? err.response.status : 'No status');
      console.error('Error headers:', err.response ? err.response.headers : 'No headers');
      setError(`Failed to load images: ${err.message}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch categories from the server
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      // Try to fetch from server
      try {
        const response = await getCategories({ limit: 10 });
        console.log('Categories response:', response.data);
        setCategories(response.data.categories || [{ id: 'all', name: 'All' }]);
      } catch (apiErr) {
        console.error('Failed to fetch categories from API:', apiErr);
        // Fallback to hardcoded categories based on our database exploration
        // Note: IDs should match the sanitized version of the name, but we use the original name for API queries
        const hardcodedCategories = [
          { id: 'all', name: 'All', count: 83 },
          { id: '19th-century', name: '19th century', count: 58 },
          { id: 'vintage', name: 'vintage', count: 44 },
          { id: 'illustration', name: 'illustration', count: 42 },
          { id: 'typography', name: 'typography', count: 42 },
          { id: 'graphic-design', name: 'graphic design', count: 38 },
          { id: 'advertisement', name: 'advertisement', count: 31 },
          { id: 'historical', name: 'historical', count: 26 },
          { id: 'antique', name: 'antique', count: 16 },
          { id: 'engraving', name: 'engraving', count: 16 }
        ];
        
        console.log('Setting hardcoded categories:', hardcodedCategories);
        setCategories(hardcodedCategories);
      }
    } catch (err) {
      console.error('Failed to set categories:', err);
      // Keep default 'All' category if there's an error
      setCategories([{ id: 'all', name: 'All' }]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Check for URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tagParam = params.get('tag');
    const searchParam = params.get('search');
    
    // Since we've added AI search to the header, redirect search queries there
    if (searchParam) {
      console.log('Redirecting search query to AI search page');
      navigate(`/search?query=${encodeURIComponent(searchParam)}`);
      return;
    }
    
    // Handle tag parameter
    if (tagParam) {
      console.log(`Tag parameter found in URL: ${tagParam}`);
      setSearchTerm(''); // Clear any existing search
      
      // Clear images first to avoid showing stale results
      setImages([]);
      
      // Try to find a matching category to set the UI state
      const matchingCategory = categories.find(cat => 
        cat.name.toLowerCase() === tagParam.toLowerCase() ||
        cat.id.toLowerCase() === tagParam.toLowerCase()
      );
      
      if (matchingCategory) {
        setActiveCategory(matchingCategory.id);
      } else {
        setActiveCategory('all'); // Reset category selection if no match
      }
      
      // Log the exact tag we're searching for to debug
      console.log(`Searching for exact tag: "${tagParam}" - Starting fresh query`);
      
      // Short timeout to ensure state updates finish
      setTimeout(() => {
        // Set this tag as the search term to find related images
        // Use exact tag matching by explicitly passing the tag parameter
        fetchImages(true, tagParam);
      }, 100);
    } 
    // Handle search parameter
    else if (searchParam) {
      console.log(`Search parameter found in URL: ${searchParam}`);
      setSearchTerm(searchParam);
      setActiveCategory('all'); // Reset category when searching
      
      // Use the search term to find matching images
      fetchImages(true);
    }
  }, [location.search, categories, navigate]);
  
  // Initial load
  useEffect(() => {
    if (!location.search) { // Only fetch all images if there are no search params
      fetchImages();
    }
    fetchCategories();
    
    // Add event listener for the custom refresh event
    const handleRefreshImages = () => {
      console.log('HomePage received refreshHomeImages event');
      setActiveCategory('all');
      setSearchTerm('');
      setImages([]);
      fetchImages(true);
    };
    
    window.addEventListener('refreshHomeImages', handleRefreshImages);
    
    // Cleanup
    return () => {
      window.removeEventListener('refreshHomeImages', handleRefreshImages);
    };
  }, []);
  
  // When filter changes, reset and fetch new images
  useEffect(() => {
    // Force a fresh fetch when category changes
    if (activeCategory !== 'all') {
      const selectedCategory = categories.find(cat => cat.id === activeCategory);
      if (selectedCategory) {
        console.log(`Category changed: Fetching images for "${selectedCategory.name}"`);
        fetchImages(true, selectedCategory.name);
      } else {
        fetchImages(true);
      }
    } else {
      fetchImages(true);
    }
  }, [activeCategory]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Update URL to reflect the search
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/'); // Clear parameters if search is empty
    }
    
    fetchImages(true);
  };
  
  const handleCategoryChange = (categoryId) => {
    console.log(`Category selected: ${categoryId}`);
    
    // Look up the actual category name 
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      console.log(`Category name: ${category.name}`);
    }
    
    setActiveCategory(categoryId);
    
    // Clear search term if changing categories to avoid confusion
    if (searchTerm) {
      setSearchTerm('');
    }
    
    // Update URL to reflect the category filter
    if (categoryId && categoryId !== 'all') {
      const categoryName = category ? category.name : categoryId;
      navigate(`/?tag=${encodeURIComponent(categoryName)}`);
    } else {
      navigate('/'); // Clear parameters if "All" is selected
    }
  };
  
  const handleLoadMore = () => {
    fetchImages();
  };
  
  // Determine if we're in tag search mode
  const params = new URLSearchParams(location.search);
  const tagParam = params.get('tag');
  const isTagSearch = Boolean(tagParam);
  
  return (
    <PageContainer>
      <ContentSection style={{ paddingTop: '2rem' }}>
        {isTagSearch && (
          <TagResultsTitle>
            <h2>Images tagged with</h2>
            <span className="tag">{tagParam}</span>
            <span className="count">({images.length} results)</span>
          </TagResultsTitle>
        )}
        <CategoryTabs>
          {categoriesLoading ? (
            // Show skeleton loaders while categories are loading
            Array(5).fill().map((_, i) => (
              <Skeleton key={i} width={100} height={35} style={{ borderRadius: '20px', marginRight: '0.5rem' }} />
            ))
          ) : (
            // Show actual category tabs
            categories.map(category => (
              <CategoryTab
                key={category.id}
                $active={activeCategory === category.id}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </CategoryTab>
            ))
          )}
        </CategoryTabs>
        
        {loading && images.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {Array(12).fill().map((_, i) => (
              <Skeleton key={i} height={300} style={{ borderRadius: '8px', marginBottom: '1rem' }} />
            ))}
          </div>
        ) : error ? (
          <div>{error}</div>
        ) : images.length === 0 && tagParam ? (
          // No results for tag search
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
              No images found with tag "{tagParam}"
            </div>
            <p>Try a different tag or browse the categories below</p>
            <button 
              onClick={() => navigate('/')} 
              style={{ 
                marginTop: '1.5rem',
                padding: '0.8rem 1.5rem',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <>
            <ImageGrid images={images} />
            
            {loading && (
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Skeleton height={40} width={150} style={{ borderRadius: '4px' }} />
              </div>
            )}
            
            {!loading && hasMore && (
              <LoadMoreButton onClick={handleLoadMore}>
                Load More
              </LoadMoreButton>
            )}
            
            {!loading && !hasMore && images.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>
                You've reached the end of the collection
              </div>
            )}
          </>
        )}
      </ContentSection>
    </PageContainer>
  );
};

export default HomePage;