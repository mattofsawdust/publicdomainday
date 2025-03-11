import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUpload, FaSync } from 'react-icons/fa';
import { getAllImages, deleteImage } from '../utils/api';
import Skeleton from 'react-loading-skeleton';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  color: #333;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => props.variant === 'danger' ? '#dc3545' : '#0066cc'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.variant === 'danger' ? '#bd2130' : '#0055aa'};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LinkButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #0066cc;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0055aa;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
`;

const BatchActionsContainer = styled.div`
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ImagesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const TableHead = styled.thead`
  background-color: #f8f9fa;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  color: #555;
  font-weight: 600;
`;

const TableCell = styled.td`
  padding: 1rem;
  vertical-align: middle;
`;

const ImagePreview = styled.img`
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  max-width: 300px;
`;

const Tag = styled.span`
  background-color: #f0f0f0;
  color: #555;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background-color: ${props => {
    if (props.variant === 'danger') return '#dc3545';
    if (props.variant === 'warning') return '#ffc107';
    return '#6c757d';
  }};
  color: white;
  border: none;
  border-radius: 4px;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => {
      if (props.variant === 'danger') return '#bd2130';
      if (props.variant === 'warning') return '#e0a800';
      return '#5a6268';
    }};
  }
`;

const NoImagesMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 4px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  background-color: ${props => props.active ? '#0066cc' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#333'};
  border: none;
  border-radius: 4px;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#0055aa' : '#e0e0e0'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AdminDashboard = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        search: searchTerm
      };
      
      const response = await getAllImages(params);
      setImages(response.data.images);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch images:', err);
      setError('Failed to load images. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchImages();
  }, [page]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchImages();
  };
  
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    try {
      await deleteImage(imageId);
      // Remove from local state
      setImages(images.filter(image => image._id !== imageId));
    } catch (err) {
      console.error('Failed to delete image:', err);
      alert('Failed to delete image. Please try again.');
    }
  };
  
  const handleSelectImage = (imageId) => {
    setSelectedImages(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId);
      } else {
        return [...prev, imageId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map(image => image._id));
    }
  };
  
  const handleBatchDelete = async () => {
    if (selectedImages.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedImages.length} images?`)) {
      return;
    }
    
    try {
      // In a real app, you might want to use a batch delete endpoint
      // For now, we'll delete one by one
      for (const imageId of selectedImages) {
        await deleteImage(imageId);
      }
      
      // Update local state
      setImages(images.filter(image => !selectedImages.includes(image._id)));
      setSelectedImages([]);
    } catch (err) {
      console.error('Failed to delete images:', err);
      alert('Failed to delete some images. Please try again.');
    }
  };
  
  const handleBatchReanalyze = async () => {
    // Placeholder for batch AI reanalysis
    alert('Batch reanalysis feature coming soon!');
  };
  
  const renderPagination = () => {
    const pages = [];
    
    pages.push(
      <PageButton 
        key="prev" 
        onClick={() => setPage(p => Math.max(1, p - 1))} 
        disabled={page === 1}
      >
        &lt;
      </PageButton>
    );
    
    // Show up to 5 page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PageButton 
          key={i} 
          active={page === i} 
          onClick={() => setPage(i)}
        >
          {i}
        </PageButton>
      );
    }
    
    pages.push(
      <PageButton 
        key="next" 
        onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
        disabled={page === totalPages}
      >
        &gt;
      </PageButton>
    );
    
    return pages;
  };
  
  if (loading && images.length === 0) {
    return (
      <DashboardContainer>
        <DashboardHeader>
          <Title>Image Management</Title>
          <Skeleton width={200} height={40} />
        </DashboardHeader>
        <Skeleton height={50} style={{ marginBottom: '2rem' }} />
        <Skeleton height={60} style={{ marginBottom: '2rem' }} />
        <Skeleton count={10} height={80} style={{ marginBottom: '1rem' }} />
      </DashboardContainer>
    );
  }
  
  return (
    <DashboardContainer>
      <DashboardHeader>
        <Title>Image Management</Title>
        <ActionButtons>
          <LinkButton to="/batch-upload">
            <FaPlus /> Upload Image
          </LinkButton>
          <LinkButton to="/batch-upload">
            <FaUpload /> Batch Upload
          </LinkButton>
        </ActionButtons>
      </DashboardHeader>
      
      <form onSubmit={handleSearch}>
        <SearchContainer>
          <SearchInput 
            type="text" 
            placeholder="Search by title, author, tags..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit">
            <FaSearch /> Search
          </Button>
          {searchTerm && (
            <Button 
              type="button" 
              onClick={() => {
                setSearchTerm('');
                fetchImages();
              }}
            >
              Clear
            </Button>
          )}
        </SearchContainer>
      </form>
      
      {selectedImages.length > 0 && (
        <BatchActionsContainer>
          <strong>{selectedImages.length} images selected</strong>
          <Button onClick={handleBatchReanalyze}>
            <FaSync /> Reanalyze with AI
          </Button>
          <Button variant="danger" onClick={handleBatchDelete}>
            <FaTrash /> Delete Selected
          </Button>
        </BatchActionsContainer>
      )}
      
      {error ? (
        <NoImagesMessage>{error}</NoImagesMessage>
      ) : images.length === 0 ? (
        <NoImagesMessage>No images found. Upload some images to get started!</NoImagesMessage>
      ) : (
        <>
          <ImagesTable>
            <TableHead>
              <TableRow>
                <TableHeader>
                  <input 
                    type="checkbox" 
                    checked={selectedImages.length === images.length}
                    onChange={handleSelectAll}
                  />
                </TableHeader>
                <TableHeader>Preview</TableHeader>
                <TableHeader>Title</TableHeader>
                <TableHeader>Author</TableHeader>
                <TableHeader>Tags</TableHeader>
                <TableHeader>Year</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {images.map(image => (
                <TableRow key={image._id}>
                  <TableCell>
                    <input 
                      type="checkbox" 
                      checked={selectedImages.includes(image._id)}
                      onChange={() => handleSelectImage(image._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <ImagePreview src={image.imageUrl} alt={image.title} />
                  </TableCell>
                  <TableCell>{image.title}</TableCell>
                  <TableCell>{image.author || 'Unknown'}</TableCell>
                  <TableCell>
                    <TagsContainer>
                      {image.tags && image.tags.slice(0, 5).map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                      ))}
                      {image.tags && image.tags.length > 5 && (
                        <Tag>+{image.tags.length - 5} more</Tag>
                      )}
                    </TagsContainer>
                  </TableCell>
                  <TableCell>{image.year || 'Unknown'}</TableCell>
                  <TableCell>
                    <ActionButtonsContainer>
                      <Link to={`/edit-image/${image._id}`}>
                        <IconButton title="Edit Image">
                          <FaEdit />
                        </IconButton>
                      </Link>
                      <IconButton 
                        variant="danger" 
                        onClick={() => handleDeleteImage(image._id)}
                        title="Delete Image"
                      >
                        <FaTrash />
                      </IconButton>
                    </ActionButtonsContainer>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </ImagesTable>
          
          <Pagination>
            {renderPagination()}
          </Pagination>
        </>
      )}
    </DashboardContainer>
  );
};

export default AdminDashboard;