import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaDownload, FaThumbsUp, FaFire, FaEye, FaHeart, FaRegHeart } from 'react-icons/fa';
import { getTrendingImages } from '../utils/api';
import Masonry from 'react-masonry-css';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    color: #ff6b6b;
  }
`;

const CategoryFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const CategoryButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background-color: ${props => props.active ? '#0066cc' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#333'};
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#0055aa' : '#e0e0e0'};
  }
`;

const MasonryGrid = styled(Masonry)`
  display: flex;
  width: 100%;
  margin-left: -1rem; /* Compensate for gutter */
  
  .masonry-grid-column {
    padding-left: 1rem; /* Gutter size */
    background-clip: padding-box;
  }
`;

const ImageCard = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 1.5rem;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    
    .overlay {
      opacity: 1;
    }
  }
`;

const ImageThumbnail = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  
  img {
    display: block;
    width: 100%;
    height: auto;
    transition: transform 0.3s ease;
  }
  
  ${ImageCard}:hover & img {
    transform: scale(1.05);
  }
`;

const ImageInfo = styled.div`
  padding: 1rem;
  background-color: white;
`;

const ImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Author = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 0.8rem 0;
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
`;

const Error = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const TrendingPage = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchTrendingImages();
  }, [selectedCategory]);
  
  const fetchTrendingImages = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      const response = await getTrendingImages(params);
      setImages(response.data.images);
      
      // If we have no categories yet and this request includes them, set them
      if (categories.length === 0 && response.data.topCategories) {
        setCategories(response.data.topCategories);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch trending images:', err);
      setError('Failed to load trending images. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };
  
  if (loading && images.length === 0) {
    return (
      <PageContainer>
        <PageTitle><FaFire /> Trending Downloads</PageTitle>
        <Loading>Loading trending images...</Loading>
      </PageContainer>
    );
  }
  
  if (error && images.length === 0) {
    return (
      <PageContainer>
        <PageTitle><FaFire /> Trending Downloads</PageTitle>
        <Error>{error}</Error>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PageTitle><FaFire /> Trending Downloads</PageTitle>
      
      {categories.length > 0 && (
        <CategoryFilters>
          <CategoryButton 
            active={!selectedCategory} 
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </CategoryButton>
          
          {categories.map((category) => (
            <CategoryButton 
              key={category._id}
              active={selectedCategory === category._id}
              onClick={() => handleCategoryClick(category._id)}
            >
              {category._id} ({category.totalDownloads})
            </CategoryButton>
          ))}
        </CategoryFilters>
      )}
      
      {loading && <Loading>Refreshing results...</Loading>}
      {error && <Error>{error}</Error>}
      
      <MasonryGrid
        breakpointCols={{
          default: 4,
          1200: 3,
          900: 2,
          600: 1
        }}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {images.map((image) => (
          <ImageCard key={image._id}>
            <Link to={`/image/${image._id}`}>
              <ImageThumbnail>
                <img 
                  src={image.imageUrl.startsWith('http') ? image.imageUrl : `http://localhost:5001${image.imageUrl}`} 
                  alt={image.title} 
                />
                <ImageOverlay className="overlay">
                  <Title>{image.title}</Title>
                  <Author>by {image.author || 'Unknown'}</Author>
                  <Stats>
                    <StatItem>
                      <FaEye /> {image.views || 0}
                    </StatItem>
                    <StatItem>
                      <FaDownload /> {image.downloads || 0}
                    </StatItem>
                    <StatItem>
                      <FaHeart /> {image.likes ? image.likes.length : 0}
                    </StatItem>
                  </Stats>
                </ImageOverlay>
              </ImageThumbnail>
            </Link>
          </ImageCard>
        ))}
      </MasonryGrid>
      
      {images.length === 0 && !loading && (
        <div style={{ textAlign: 'center', margin: '3rem 0' }}>
          <p>No images found for this category.</p>
        </div>
      )}
    </PageContainer>
  );
};

export default TrendingPage;