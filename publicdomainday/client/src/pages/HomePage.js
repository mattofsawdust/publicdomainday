import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { getAllImages, getCategories } from '../utils/api';
import ImageGrid from '../components/images/ImageGrid';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PageContainer = styled.div`
  min-height: 100vh;
`;

const HeroSection = styled.div`
  position: relative;
  height: ${props => props.compact ? '300px' : '500px'};
  background-image: url('https://images.unsplash.com/photo-1535957998253-26ae1ef29506?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 2rem;
  transition: height 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }
`;

const HeroContent = styled.div`
  text-align: center;
  z-index: 2;
  max-width: 800px;
  padding: 0 2rem;
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

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border-radius: 4px;
  border: none;
  font-size: 1.1rem;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.3);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #555;
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
      
      // If a tag parameter is provided (from URL), use it
      if (tagParam) {
        params.tag = tagParam;
        console.log(`Filtering by tag parameter: "${tagParam}"`);
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
          console.log(`Filtering by tag: "${selectedCategory.name}"`);
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
    
    // Handle tag parameter
    if (tagParam) {
      console.log(`Tag parameter found in URL: ${tagParam}`);
      setSearchTerm(''); // Clear any existing search
      
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
      
      // Set this tag as the search term to find related images
      fetchImages(true, tagParam);
    } 
    // Handle search parameter
    else if (searchParam) {
      console.log(`Search parameter found in URL: ${searchParam}`);
      setSearchTerm(searchParam);
      setActiveCategory('all'); // Reset category when searching
      
      // Use the search term to find matching images
      fetchImages(true);
    }
  }, [location.search, categories]);
  
  // Initial load
  useEffect(() => {
    if (!location.search) { // Only fetch all images if there are no search params
      fetchImages();
    }
    fetchCategories();
  }, []);
  
  // When filter changes, reset and fetch new images
  useEffect(() => {
    fetchImages(true);
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
      <HeroSection compact={isTagSearch}>
        <HeroContent>
          <HeroTitle>Public Domain Day</HeroTitle>
          <HeroSubtitle>
            Discover and share beautiful public domain imagery from around the world
          </HeroSubtitle>
          <form onSubmit={handleSearch}>
            <SearchContainer>
              <SearchIcon>
                <FaSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search public domain images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
          </form>
        </HeroContent>
      </HeroSection>
      
      <ContentSection>
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