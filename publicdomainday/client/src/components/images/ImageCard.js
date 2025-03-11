import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaHeart, FaRegHeart, FaEye } from 'react-icons/fa';
import { toggleLikeImage } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Card = styled.div`
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

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

const Image = styled.img`
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.3s ease;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const Overlay = styled.div`
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
  margin: 0;
  font-size: 1.1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  
  &:hover {
    color: #ff4d4d;
  }
  
  svg {
    color: ${props => props.isLiked ? '#ff4d4d' : 'white'};
  }
`;

const ImageCard = ({ image }) => {
  const { currentUser } = useAuth();
  const [likes, setLikes] = React.useState(image.likes || []);
  const [views, setViews] = React.useState(image.views || 0);
  
  const isLiked = currentUser && likes.some(like => like === currentUser.id);
  
  const handleLike = async (e) => {
    e.preventDefault(); // Prevent navigation
    
    if (!currentUser) {
      // Redirect to login or show login prompt
      alert('Please login to like images');
      return;
    }
    
    try {
      const response = await toggleLikeImage(image._id);
      
      // Update local state
      if (response.data.userLiked) {
        setLikes(prev => [...prev, currentUser.id]);
      } else {
        setLikes(prev => prev.filter(id => id !== currentUser.id));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };
  
  return (
    <Card>
      <Link to={`/image/${image._id}`}>
        <ImageContainer>
          <Image 
            src={image.imageUrl.startsWith('http') ? image.imageUrl : `http://localhost:5001${image.imageUrl}`} 
            alt={image.title} 
          />
        </ImageContainer>
        
        <Overlay className="overlay">
          <Title>{image.title}</Title>
          
          <Stats>
            <Stat>
              <FaEye /> {views}
            </Stat>
            
            <LikeButton onClick={handleLike} isLiked={isLiked}>
              {isLiked ? <FaHeart /> : <FaRegHeart />} {likes.length}
            </LikeButton>
          </Stats>
        </Overlay>
      </Link>
    </Card>
  );
};

export default ImageCard;