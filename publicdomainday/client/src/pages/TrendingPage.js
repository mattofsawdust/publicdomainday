import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaDownload, FaThumbsUp, FaFire } from 'react-icons/fa';
import { getTrendingImages } from '../utils/api';

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

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
`;

const ImageCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ImageThumbnail = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f0f0f0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  ${ImageCard}:hover & img {
    transform: scale(1.05);
  }
`;

const ImageInfo = styled.div`
  padding: 1rem;
  background-color: white;
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
      
      <GridContainer>
        {images.map((image) => (
          <ImageCard key={image._id}>
            <Link to={`/images/${image._id}`}>
              <ImageThumbnail>
                <img 
                  src={image.imageUrl.startsWith('http') ? image.imageUrl : `http://localhost:5001${image.imageUrl}`} 
                  alt={image.title} 
                />
              </ImageThumbnail>
            </Link>
            
            <ImageInfo>
              <Link to={`/images/${image._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Title>{image.title}</Title>
              </Link>
              <Author>by {image.author || 'Unknown'}</Author>
              
              <Stats>
                <StatItem>
                  <FaDownload /> {image.downloads || 0}
                </StatItem>
                <StatItem>
                  <FaThumbsUp /> {image.likes ? image.likes.length : 0}
                </StatItem>
              </Stats>
            </ImageInfo>
          </ImageCard>
        ))}
      </GridContainer>
      
      {images.length === 0 && !loading && (
        <div style={{ textAlign: 'center', margin: '3rem 0' }}>
          <p>No images found for this category.</p>
        </div>
      )}
    </PageContainer>
  );
};

export default TrendingPage;