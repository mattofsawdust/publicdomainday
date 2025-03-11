import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaEdit, FaCamera, FaTwitter, FaInstagram, FaFacebook, FaGlobe } from 'react-icons/fa';
import { getUserProfile, uploadProfileImage } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ProfileSkeleton from './ProfileSkeleton';
import ImageGrid from '../images/ImageGrid';
import ProfileEditForm from './ProfileEditForm';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const AvatarOverlay = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #0066cc;
  color: white;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background-color: #0055aa;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProfileBio = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const EditButton = styled.button`
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  color: #555;
  font-size: 1.2rem;
  
  &:hover {
    color: #0066cc;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const StatBox = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  flex: 1;
  min-width: 150px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  h3 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    color: #0066cc;
  }
  
  p {
    color: #666;
    margin: 0;
    font-size: 0.9rem;
  }
`;

const TabsContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  color: ${props => props.active ? '#0066cc' : '#666'};
  border-bottom: ${props => props.active ? '2px solid #0066cc' : '2px solid transparent'};
  
  &:hover {
    color: #0066cc;
  }
`;

const ProfileSectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const Profile = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('uploads');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const fileInputRef = React.useRef();
  
  const isOwner = currentUser && currentUser.id === id;
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile(id);
        setUserProfile(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id]);
  
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingImage(true);
      const response = await uploadProfileImage(id, file);
      
      // Update user profile with new image
      setUserProfile(prevState => ({
        ...prevState,
        user: {
          ...prevState.user,
          profileImage: response.data.profileImage
        }
      }));
      
    } catch (err) {
      console.error('Failed to upload profile image:', err);
      alert('Failed to upload profile image');
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleProfileUpdate = (updatedUserData) => {
    setUserProfile(prevState => ({
      ...prevState,
      user: {
        ...prevState.user,
        ...updatedUserData
      }
    }));
    
    // If the current user is viewing their own profile, update auth context
    if (isOwner && updatedUserData) {
      // Your context update logic here if needed
    }
  };
  
  if (loading) {
    return <ProfileSkeleton />;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  const { user, images } = userProfile;
  
  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarContainer>
          <Avatar 
            src={user.profileImage || '/default-avatar.png'}
            alt={user.username}
          />
          {isOwner && (
            <AvatarOverlay onClick={() => fileInputRef.current.click()}>
              <FaCamera />
              <FileInput 
                type="file" 
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
              />
            </AvatarOverlay>
          )}
        </AvatarContainer>
        
        <ProfileInfo>
          <ProfileName>
            {user.username}
            {isOwner && (
              <EditButton onClick={() => setShowEditForm(true)}>
                <FaEdit /> Edit Profile
              </EditButton>
            )}
          </ProfileName>
          
          <ProfileBio>{user.bio || 'No bio yet.'}</ProfileBio>
          
          <SocialLinks>
            {user.socialLinks?.website && (
              <SocialLink href={user.socialLinks.website} target="_blank" rel="noopener noreferrer">
                <FaGlobe />
              </SocialLink>
            )}
            {user.socialLinks?.twitter && (
              <SocialLink href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </SocialLink>
            )}
            {user.socialLinks?.instagram && (
              <SocialLink href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </SocialLink>
            )}
            {user.socialLinks?.facebook && (
              <SocialLink href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </SocialLink>
            )}
          </SocialLinks>
        </ProfileInfo>
      </ProfileHeader>
      
      <StatsContainer>
        <StatBox>
          <h3>{user.analytics.totalImages}</h3>
          <p>Uploads</p>
        </StatBox>
        <StatBox>
          <h3>{user.analytics.totalViews}</h3>
          <p>Views</p>
        </StatBox>
        <StatBox>
          <h3>{user.analytics.totalLikes}</h3>
          <p>Likes</p>
        </StatBox>
      </StatsContainer>
      
      <TabsContainer>
        <TabList>
          <Tab 
            active={activeTab === 'uploads'} 
            onClick={() => setActiveTab('uploads')}
          >
            Uploads
          </Tab>
          {isOwner && (
            <Tab 
              active={activeTab === 'saved'} 
              onClick={() => setActiveTab('saved')}
            >
              Saved
            </Tab>
          )}
        </TabList>
        
        {activeTab === 'uploads' && (
          <>
            <ProfileSectionTitle>
              {images.length > 0 ? 'Uploaded Photos' : 'No uploads yet'}
            </ProfileSectionTitle>
            {images.length > 0 && <ImageGrid images={images} />}
          </>
        )}
        
        {activeTab === 'saved' && (
          <ProfileSectionTitle>Saved photos coming soon!</ProfileSectionTitle>
        )}
      </TabsContainer>
      
      {/* Edit Profile Form Modal */}
      {showEditForm && (
        <ProfileEditForm 
          user={user}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleProfileUpdate}
        />
      )}
    </ProfileContainer>
  );
};

export default Profile;