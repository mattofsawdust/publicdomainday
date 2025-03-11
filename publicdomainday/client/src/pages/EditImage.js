import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSave, FaTrash, FaTimes, FaPlus, FaSync } from 'react-icons/fa';
import { getImageById, updateImage, deleteImage } from '../utils/api';
import Skeleton from 'react-loading-skeleton';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
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
    justify-content: flex-start;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => {
    if (props.variant === 'danger') return '#dc3545';
    if (props.variant === 'secondary') return '#6c757d';
    return '#0066cc';
  }};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => {
      if (props.variant === 'danger') return '#bd2130';
      if (props.variant === 'secondary') return '#5a6268';
      return '#0055aa';
    }};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div``;

const RightColumn = styled.div``;

const ImagePreview = styled.img`
  width: 100%;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormSection = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0 0 1.5rem 0;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.9rem;
  
  button {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    margin-left: 0.5rem;
    padding: 0;
    display: flex;
    align-items: center;
    
    &:hover {
      color: #dc3545;
    }
  }
`;

const AddTagForm = styled.div`
  display: flex;
  margin-top: 1rem;
  
  input {
    flex: 1;
    margin-right: 0.5rem;
  }
`;

const MetadataItem = styled.div`
  margin-bottom: 0.5rem;
  
  strong {
    display: inline-block;
    min-width: 120px;
    color: #555;
  }
`;

const AITagsContainer = styled.div`
  margin-top: 1rem;
`;

const AISuggestionTag = styled.button`
  background-color: ${props => props.selected ? '#e6f3ff' : '#f0f0f0'};
  color: ${props => props.selected ? '#0066cc' : '#555'};
  border: ${props => props.selected ? '1px solid #0066cc' : '1px solid transparent'};
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  margin: 0 0.3rem 0.3rem 0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.selected ? '#d4e9ff' : '#e0e0e0'};
  }
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const EditImage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    year: '',
    publicDomain: true,
    tags: []
  });
  
  const [newTag, setNewTag] = useState('');
  
  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        const response = await getImageById(id);
        setImage(response.data);
        
        // Initialize form data
        setFormData({
          title: response.data.title || '',
          description: response.data.description || '',
          author: response.data.author || '',
          year: response.data.year || '',
          publicDomain: response.data.publicDomain !== false,
          tags: response.data.tags || []
        });
        
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
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    
    // Check if tag already exists
    if (formData.tags.includes(newTag.trim())) {
      setNewTag('');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    
    setNewTag('');
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleAddAITag = (aiTag) => {
    // Check if tag already exists in user tags
    if (formData.tags.includes(aiTag)) {
      // Remove it
      handleRemoveTag(aiTag);
    } else {
      // Add it
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, aiTag]
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      await updateImage(id, {
        title: formData.title,
        description: formData.description,
        author: formData.author,
        year: formData.year,
        publicDomain: formData.publicDomain,
        tags: formData.tags.join(',')
      });
      
      // Navigate back to dashboard
      navigate('/admin');
    } catch (err) {
      console.error('Failed to update image:', err);
      alert('Failed to update image. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    try {
      await deleteImage(id);
      navigate('/admin');
    } catch (err) {
      console.error('Failed to delete image:', err);
      alert('Failed to delete image. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <PageContainer>
        <PageHeader>
          <Title>Edit Image</Title>
          <Skeleton width={200} height={40} />
        </PageHeader>
        <FormGrid>
          <LeftColumn>
            <Skeleton height={300} style={{ marginBottom: '1rem' }} />
            <Skeleton height={200} />
          </LeftColumn>
          <RightColumn>
            <Skeleton height={400} />
          </RightColumn>
        </FormGrid>
      </PageContainer>
    );
  }
  
  if (error) {
    return (
      <PageContainer>
        <ErrorMessage>{error}</ErrorMessage>
        <Button onClick={() => navigate('/admin')}>
          Go Back to Dashboard
        </Button>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PageHeader>
        <Title>Edit Image</Title>
        <ActionButtons>
          <Button onClick={() => navigate('/admin')} variant="secondary">
            <FaTimes /> Cancel
          </Button>
          <Button onClick={handleDelete} variant="danger">
            <FaTrash /> Delete
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </ActionButtons>
      </PageHeader>
      
      <FormGrid>
        <LeftColumn>
          <ImagePreview src={image.imageUrl} alt={image.title} />
          
          <FormSection>
            <SectionTitle>
              AI-Generated Information
              <Button 
                type="button" 
                size="small"
                onClick={async () => {
                  if (window.confirm('This will reanalyze the image using AI, which may generate new tags and descriptions. Continue?')) {
                    try {
                      const response = await fetch(`/api/images/${id}/analyze`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        }
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        alert('Image successfully reanalyzed! Refreshing data...');
                        window.location.reload();
                      } else {
                        alert('Failed to reanalyze image. Please try again later.');
                      }
                    } catch (error) {
                      console.error('Error reanalyzing image:', error);
                      alert('Error reanalyzing image: ' + error.message);
                    }
                  }
                }}
              >
                <FaSync /> Reanalyze
              </Button>
            </SectionTitle>
            
            {image.aiDescription && (
              <FormGroup>
                <Label>AI Description</Label>
                <div>{image.aiDescription}</div>
              </FormGroup>
            )}
            
            {image.aiTags && image.aiTags.length > 0 && (
              <FormGroup>
                <Label>AI-Suggested Tags</Label>
                <div style={{ marginBottom: '0.5rem' }}>
                  <small style={{ color: '#666' }}>
                    Click tags to add/remove them from your image. These AI-generated tags help users discover your image.
                  </small>
                </div>
                <AITagsContainer>
                  {image.aiTags.map((tag, index) => (
                    <AISuggestionTag 
                      key={index}
                      selected={formData.tags.includes(tag)}
                      onClick={() => handleAddAITag(tag)}
                    >
                      {tag} {formData.tags.includes(tag) ? '✓' : ''}
                    </AISuggestionTag>
                  ))}
                </AITagsContainer>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <Button 
                    type="button" 
                    size="small" 
                    onClick={() => {
                      // Add all AI tags that aren't already in the user tags
                      const newTags = [...formData.tags];
                      image.aiTags.forEach(tag => {
                        if (!newTags.includes(tag)) {
                          newTags.push(tag);
                        }
                      });
                      setFormData(prev => ({ ...prev, tags: newTags }));
                    }}
                  >
                    Add All Tags
                  </Button>
                  <Button 
                    type="button"
                    variant="secondary"
                    size="small" 
                    onClick={() => {
                      // Remove all AI tags from the user tags
                      const newTags = formData.tags.filter(tag => !image.aiTags.includes(tag));
                      setFormData(prev => ({ ...prev, tags: newTags }));
                    }}
                  >
                    Remove All
                  </Button>
                </div>
              </FormGroup>
            )}
            
            {image.exifData && Object.keys(image.exifData).length > 0 && (
              <FormGroup>
                <Label>EXIF Data</Label>
                {Object.entries(image.exifData).map(([key, value]) => (
                  <MetadataItem key={key}>
                    <strong>{key}:</strong> {value}
                  </MetadataItem>
                ))}
              </FormGroup>
            )}
          </FormSection>
        </LeftColumn>
        
        <RightColumn>
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="title">Title *</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the image..."
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="author">Author/Creator</Label>
                <Input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Who created this work"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="year">Year</Label>
                <Input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="Year of creation"
                  min="1"
                  max={new Date().getFullYear()}
                />
              </FormGroup>
              
              <FormGroup>
                <Label>
                  <Checkbox
                    type="checkbox"
                    name="publicDomain"
                    checked={formData.publicDomain}
                    onChange={handleChange}
                  />
                  This work is in the public domain
                </Label>
              </FormGroup>
            </form>
          </FormSection>
          
          <FormSection>
            <SectionTitle>Tags</SectionTitle>
            
            <Label>Current Tags</Label>
            <TagsContainer>
              {formData.tags.length === 0 ? (
                <div>No tags added yet.</div>
              ) : (
                formData.tags.map((tag, index) => (
                  <Tag key={index}>
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}>
                      <FaTimes />
                    </button>
                  </Tag>
                ))
              )}
            </TagsContainer>
            
            <AddTagForm>
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a new tag"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
              />
              <Button type="button" onClick={handleAddTag}>
                <FaPlus /> Add
              </Button>
            </AddTagForm>
          </FormSection>
        </RightColumn>
      </FormGrid>
    </PageContainer>
  );
};

export default EditImage;