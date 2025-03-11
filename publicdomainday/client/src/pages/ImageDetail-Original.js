import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaDownload, FaHeart, FaArrowLeft, FaTags, FaInfoCircle, FaSearch, FaTimes } from 'react-icons/fa';
import { getImageById, toggleLikeImage, downloadImage } from '../utils/api';

// Styled components
const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
  text-decoration: none;
  margin-bottom: 2rem;
  font-weight: 500;
  transition: color 0.2s;
  
  &:hover {
    color: #0066cc;
  }
`;

const ImageContainer = styled.div`
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainImageContainer = styled.div`
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const MainImage = styled.img`
  max-width: 100%;
  max-height: 80vh;
  display: block;
  cursor: zoom-in;
`;

const InfoPanel = styled.div``;

const InfoCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0 0 1rem 0;
  color: #333;
`;

const Description = styled.p`
  color: #555;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const MetaInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  
  strong {
    min-width: 120px;
    color: #555;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => props.primary ? '#0066cc' : 'white'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: 1px solid ${props => props.primary ? '#0066cc' : '#ddd'};
  border-radius: 4px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#0055aa' : '#f9f9f9'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Tag = styled.span`
  background-color: #f0f0f0;
  color: #333;
  padding: 0.4rem 0.7rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
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

// Full-screen modal for viewing high-resolution image
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: zoom-out;
`;

const ModalContent = styled.div`
  position: relative;
  width: 90vw;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FullSizeImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const CloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  
  &:hover {
    color: #cccccc;
  }
`;

const ZoomIndicator = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
  font-size: 0.9rem;
  opacity: 0.7;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
`;

const ImageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liking, setLiking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        const response = await getImageById(id);
        setImage(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch image:', err);
        setError('Failed to load image. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchImage();
  }, [id]);
  
  const handleLike = async () => {
    try {
      setLiking(true);
      const response = await toggleLikeImage(id);
      
      // Update the likes count
      setImage(prev => ({
        ...prev,
        likes: Array.isArray(prev.likes) 
          ? [...prev.likes, 'temp-id'] // Add a temporary ID
          : ['temp-id'] // Create a new array if likes doesn't exist
      }));
    } catch (err) {
      console.error('Failed to like image:', err);
    } finally {
      setLiking(false);
    }
  };
  
  const handleDownload = () => {
    // Use the download API endpoint which will track downloads
    const downloadUrl = downloadImage(id);
    
    // Create an invisible link and click it
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = image.title || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Open the full-size image modal
  const openModal = () => {
    setModalOpen(true);
    // Add event listener to handle ESC key to close modal
    document.addEventListener('keydown', handleKeyDown);
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
  };
  
  // Close the full-size image modal
  const closeModal = () => {
    setModalOpen(false);
    // Remove event listener when modal is closed
    document.removeEventListener('keydown', handleKeyDown);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };
  
  // Handle key press events (ESC to close modal)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  
  if (loading) {
    return (
      <PageContainer>
        <BackButton to="/">
          <FaArrowLeft /> Back to Gallery
        </BackButton>
        <Loading>Loading image details...</Loading>
      </PageContainer>
    );
  }
  
  if (error) {
    return (
      <PageContainer>
        <BackButton to="/">
          <FaArrowLeft /> Back to Gallery
        </BackButton>
        <Error>{error}</Error>
      </PageContainer>
    );
  }
  
  if (!image) {
    return (
      <PageContainer>
        <BackButton to="/">
          <FaArrowLeft /> Back to Gallery
        </BackButton>
        <Error>Image not found</Error>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <BackButton to="/">
        <FaArrowLeft /> Back to Gallery
      </BackButton>
      
      <ImageContainer>
        <MainImageContainer>
          <MainImage 
            src={image.imageUrl.startsWith('http') ? image.imageUrl : `http://localhost:5001${image.imageUrl}`} 
            alt={image.title} 
            onClick={openModal}
          />
        </MainImageContainer>
        
        {/* Full-size image modal */}
        {modalOpen && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <CloseButton onClick={closeModal}>
                <FaTimes /> Close
              </CloseButton>
              <FullSizeImage 
                src={image.imageUrl.startsWith('http') ? image.imageUrl : `http://localhost:5001${image.imageUrl}`} 
                alt={image.title}
              />
              <ZoomIndicator>
                <FaSearch /> Click anywhere to close
              </ZoomIndicator>
            </ModalContent>
          </ModalOverlay>
        )}
        
        <InfoPanel>
          <InfoCard>
            <Title>{image.title}</Title>
            
            <Description>
              {image.description || image.aiDescription || 'No description provided.'}
            </Description>
            
            <MetaInfo>
              <MetaItem>
                <strong>Author:</strong> {image.author || 'Unknown'}
              </MetaItem>
              
              {image.year && (
                <MetaItem>
                  <strong>Year:</strong> {image.year}
                </MetaItem>
              )}
              
              <MetaItem>
                <strong>License:</strong> {image.publicDomain ? 'Public Domain' : 'Standard License'}
              </MetaItem>
              
              <MetaItem>
                <strong>Views:</strong> {image.views || 0}
              </MetaItem>
              
              <MetaItem>
                <strong>Downloads:</strong> {image.downloads || 0}
              </MetaItem>
              
              <MetaItem>
                <strong>Likes:</strong> {image.likes ? image.likes.length : 0}
              </MetaItem>
            </MetaInfo>
            
            <ActionButtons>
              <Button primary onClick={handleDownload}>
                <FaDownload /> Download
              </Button>
              
              <Button onClick={handleLike} disabled={liking}>
                <FaHeart color={liking ? '#ff6b6b' : '#999'} /> 
                {liking ? 'Liking...' : 'Like'}
              </Button>
            </ActionButtons>
          </InfoCard>
          
          {((image.tags && image.tags.length > 0) || (image.aiTags && image.aiTags.length > 0)) && (
            <InfoCard>
              <h3><FaTags style={{ marginRight: '0.5rem' }} /> Tags</h3>
              <TagsContainer>
                {image.tags && image.tags.map((tag, index) => (
                  <Tag key={`user-${index}`}>{tag}</Tag>
                ))}
                
                {image.aiTags && image.aiTags
                  .filter(tag => !image.tags || !image.tags.includes(tag))
                  .map((tag, index) => (
                    <Tag key={`ai-${index}`} style={{ background: '#e6f7ff', borderColor: '#91d5ff' }}>
                      {tag}
                    </Tag>
                  ))
                }
              </TagsContainer>
            </InfoCard>
          )}
          
          {image.exifData && Object.keys(image.exifData).length > 0 && (
            <InfoCard>
              <h3><FaInfoCircle style={{ marginRight: '0.5rem' }} /> Technical Details</h3>
              
              {Object.entries(image.exifData).map(([key, value]) => (
                <MetaItem key={key}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                </MetaItem>
              ))}
            </InfoCard>
          )}
        </InfoPanel>
      </ImageContainer>
    </PageContainer>
  );
};

export default ImageDetail;