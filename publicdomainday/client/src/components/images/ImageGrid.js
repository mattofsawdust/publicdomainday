import React from 'react';
import styled from 'styled-components';
import Masonry from 'react-masonry-css';
import ImageCard from './ImageCard';

const MasonryGrid = styled(Masonry)`
  display: flex;
  width: 100%;
  margin-left: -1rem; /* Compensate for gutter */
  
  .masonry-grid-column {
    padding-left: 1rem; /* Gutter size */
    background-clip: padding-box;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem 0;
  color: #666;
  font-size: 1.1rem;
`;

const ImageGrid = ({ images }) => {
  const breakpointColumns = {
    default: 4,
    1200: 3,
    900: 2,
    600: 1
  };

  if (!images || images.length === 0) {
    return <EmptyMessage>No images found</EmptyMessage>;
  }

  return (
    <MasonryGrid
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
    >
      {images.map(image => (
        <ImageCard key={image._id} image={image} />
      ))}
    </MasonryGrid>
  );
};

export default ImageGrid;