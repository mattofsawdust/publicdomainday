import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaDownload, FaHeart, FaArrowLeft, FaTags, FaInfoCircle, FaSearch, FaTimes, FaSpinner, FaEye } from 'react-icons/fa';
import { getImageById, toggleLikeImage, downloadImage, getAllImages, getRelatedImages } from '../utils/api';
import Masonry from 'react-masonry-css';

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
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

const DetailsContainer = styled.div`
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const InfoPanel = styled.div``;

const TagsSection = styled.div`
  margin-bottom: 1.5rem;
`;

const RelatedImagesSection = styled.div`
  margin-top: 3rem;
  width: 100%;
`;

const RelatedImagesTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 50px;
    height: 3px;
    background-color: #0066cc;
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

const RelatedImageCard = styled.div`
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

const RelatedImageLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const RelatedImageThumb = styled.img`
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
  
  ${RelatedImageCard}:hover & {
    transform: scale(1.05);
  }
`;

const RelatedImageInfo = styled.div`
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
  class: overlay;
`;

const RelatedImageTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RelatedImageAuthor = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
`;

const RelatedImageStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
`;

const RelatedImageStat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  svg {
    font-size: 0.9rem;
  }
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 2rem auto;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

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

const Tag = styled(Link)`
  background-color: #f0f0f0;
  color: #333;
  padding: 0.4rem 0.7rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
    transform: translateY(-2px);
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
  
  // Related images state
  const [relatedImages, setRelatedImages] = useState([]);
  const [relatedImagesPage, setRelatedImagesPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreRelated, setHasMoreRelated] = useState(true);
  
  // Observer for infinite scroll
  const observer = useRef();
  const lastImageElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreRelated) {
        loadMoreRelatedImages();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMoreRelated]);
  
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
  
  // Load related images when main image loads
  useEffect(() => {
    if (image) {
      fetchRelatedImages();
    }
  }, [image]);
  
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
  
  // Fetch related images based on current image's tags
  const fetchRelatedImages = async () => {
    try {
      // Use the getAllImages API with the first tag as search term
      // We'll simulate "related" images until a proper endpoint is created
      if (!image || (!image.tags && !image.aiTags) || relatedImagesPage > 1) return;
      
      setLoadingMore(true);
      
      // Get the tags from the current image to use as search terms
      const searchTags = [...(image.tags || []), ...(image.aiTags || [])];
      
      if (searchTags.length === 0) return;
      
      // Use the first tag as search term for related images
      const tag = searchTags[0];
      
      const response = await getAllImages({
        tag,
        page: relatedImagesPage,
        limit: 8
      });
      
      // Filter out the current image from related images
      const filtered = response.data.images.filter(img => img._id !== id);
      
      setRelatedImages(filtered);
      setHasMoreRelated(response.data.currentPage < response.data.totalPages);
      
    } catch (err) {
      console.error('Failed to fetch related images:', err);
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Load more related images for infinite scroll
  const loadMoreRelatedImages = async () => {
    if (!hasMoreRelated || loadingMore) return;
    
    try {
      setLoadingMore(true);
      
      // Use the same approach as fetchRelatedImages but with next page
      const nextPage = relatedImagesPage + 1;
      
      // Get the tags from the current image to use as search terms
      const searchTags = [...(image.tags || []), ...(image.aiTags || [])];
      
      if (searchTags.length === 0) {
        setHasMoreRelated(false);
        return;
      }
      
      // Use the first tag as search term for related images
      const tag = searchTags[0];
      
      const response = await getAllImages({
        tag,
        page: nextPage,
        limit: 8
      });
      
      // Filter out the current image from related images
      const filtered = response.data.images.filter(img => img._id !== id);
      
      setRelatedImages(prev => [...prev, ...filtered]);
      setRelatedImagesPage(nextPage);
      setHasMoreRelated(response.data.currentPage < response.data.totalPages);
      
    } catch (err) {
      console.error('Failed to load more related images:', err);
    } finally {
      setLoadingMore(false);
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
        {/* Main Image Section (Top) */}
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
        
        {/* Details Section (Split into two columns) */}
        <DetailsContainer>
          {/* Left side - Info and Tags */}
          <div>
            <InfoCard>
              <Title>{image.title}</Title>
              
              <Description>
                {image.description || image.aiDescription || 'No description provided.'}
              </Description>
              
              {/* Tags shown directly here for SEO */}
              {((image.tags && image.tags.length > 0) || (image.aiTags && image.aiTags.length > 0)) && (
                <TagsSection>
                  <h3><FaTags style={{ marginRight: '0.5rem' }} /> Tags</h3>
                  <TagsContainer>
                    {image.tags && image.tags.map((tag, index) => (
                      <Tag key={`user-${index}`} to={`/?tag=${encodeURIComponent(tag)}`}>{tag}</Tag>
                    ))}
                    
                    {image.aiTags && image.aiTags
                      .filter(tag => !image.tags || !image.tags.includes(tag))
                      .map((tag, index) => (
                        <Tag 
                          key={`ai-${index}`} 
                          to={`/?tag=${encodeURIComponent(tag)}`}
                          style={{ background: '#e6f7ff', borderColor: '#91d5ff' }}
                        >
                          {tag}
                        </Tag>
                      ))
                    }
                  </TagsContainer>
                </TagsSection>
              )}
              
              {image.exifData && Object.keys(image.exifData).length > 0 && (
                <div>
                  <h3><FaInfoCircle style={{ marginRight: '0.5rem' }} /> Technical Details</h3>
                  
                  {Object.entries(image.exifData).map(([key, value]) => (
                    <MetaItem key={key}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                    </MetaItem>
                  ))}
                </div>
              )}
            </InfoCard>
          </div>
          
          {/* Right side - Stats and Actions */}
          <InfoPanel>
            <InfoCard>
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
          </InfoPanel>
        </DetailsContainer>
        
        {/* Related Images (Infinite Scroll) */}
        <RelatedImagesSection>
          <RelatedImagesTitle>Related Images</RelatedImagesTitle>
          
          {relatedImages.length > 0 ? (
            <>
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
                {relatedImages.map((relatedImage, index) => {
                  // Apply the ref to the last element for infinite scrolling
                  const isLastElement = index === relatedImages.length - 1;
                  return (
                    <div 
                      key={relatedImage._id}
                      ref={isLastElement ? lastImageElementRef : null}
                    >
                    <RelatedImageCard>
                      <RelatedImageLink to={`/image/${relatedImage._id}`}>
                        <RelatedImageThumb 
                          src={relatedImage.imageUrl.startsWith('http') ? relatedImage.imageUrl : `http://localhost:5001${relatedImage.imageUrl}`} 
                          alt={relatedImage.title} 
                        />
                        <RelatedImageInfo className="overlay">
                          <RelatedImageTitle>{relatedImage.title}</RelatedImageTitle>
                          <RelatedImageAuthor>by {relatedImage.author || 'Unknown'}</RelatedImageAuthor>
                          <RelatedImageStats>
                            <RelatedImageStat>
                              <FaEye /> {relatedImage.views || 0}
                            </RelatedImageStat>
                            <RelatedImageStat>
                              <FaHeart /> {relatedImage.likes ? relatedImage.likes.length : 0}
                            </RelatedImageStat>
                          </RelatedImageStats>
                        </RelatedImageInfo>
                      </RelatedImageLink>
                    </RelatedImageCard>
                    </div>
                  );
                })}
              </MasonryGrid>
              
              {loadingMore && (
                <div style={{ textAlign: 'center', padding: '2rem', margin: '0 auto' }}>
                  <FaSpinner style={{ 
                    fontSize: '2.5rem', 
                    animation: 'spin 1s linear infinite',
                    color: '#0066cc',
                    opacity: 0.7
                  }} />
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              )}
              
              {!hasMoreRelated && !loadingMore && relatedImages.length > 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  color: '#777',
                  borderTop: '1px solid #eee',
                  marginTop: '2rem',
                  fontSize: '1rem',
                  fontStyle: 'italic'
                }}>
                  You've reached the end of related images
                </div>
              )}
            </>
          ) : loadingMore ? (
            <div style={{ textAlign: 'center', padding: '2rem', margin: '0 auto' }}>
              <FaSpinner style={{ 
                fontSize: '2.5rem', 
                animation: 'spin 1s linear infinite',
                color: '#0066cc',
                opacity: 0.7
              }} />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              color: '#666',
              background: '#f9f9f9',
              borderRadius: '8px',
              marginTop: '1rem' 
            }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No related images found</div>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>Try searching for similar images in the gallery</div>
            </div>
          )}
        </RelatedImagesSection>
      </ImageContainer>
    </PageContainer>
  );
};

export default ImageDetail;