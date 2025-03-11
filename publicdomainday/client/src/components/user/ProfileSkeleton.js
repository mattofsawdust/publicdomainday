import React from 'react';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
  width: 150px;
  height: 150px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
`;

const ProfileInfo = styled.div`
  flex: 1;
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
`;

const TabsContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
`;

const ProfileSkeleton = () => {
  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarContainer>
          <Skeleton circle height={150} width={150} />
        </AvatarContainer>
        
        <ProfileInfo>
          <Skeleton height={40} width={300} style={{ marginBottom: '1rem' }} />
          <Skeleton count={3} style={{ marginBottom: '1rem' }} />
          <Skeleton width={120} height={30} />
        </ProfileInfo>
      </ProfileHeader>
      
      <StatsContainer>
        <StatBox>
          <Skeleton height={40} />
          <Skeleton width={80} />
        </StatBox>
        <StatBox>
          <Skeleton height={40} />
          <Skeleton width={80} />
        </StatBox>
        <StatBox>
          <Skeleton height={40} />
          <Skeleton width={80} />
        </StatBox>
      </StatsContainer>
      
      <TabsContainer>
        <TabList>
          <Skeleton width={100} height={40} style={{ marginRight: '1rem' }} />
          <Skeleton width={100} height={40} />
        </TabList>
        
        <Skeleton height={30} width={200} style={{ marginBottom: '2rem' }} />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} height={200} style={{ borderRadius: '8px' }} />
          ))}
        </div>
      </TabsContainer>
    </ProfileContainer>
  );
};

export default ProfileSkeleton;