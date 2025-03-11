import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaSave, FaEye, FaTrash } from 'react-icons/fa';
import { getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost } from '../../utils/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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

const EditorHeader = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
`;

const EditorForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
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
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 400px;
  font-family: monospace;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #0066cc;
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #0055aa;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover:not(:disabled) {
    background-color: #f5f5f5;
  }
`;

const DangerButton = styled(Button)`
  background-color: #dc3545;
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #c82333;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published: true,
    pinned: false
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  useEffect(() => {
    if (isEditMode) {
      const fetchPost = async () => {
        try {
          setLoading(true);
          const response = await getBlogPostById(id);
          setFormData({
            title: response.data.title,
            content: response.data.content,
            published: response.data.published,
            pinned: response.data.pinned
          });
          setError(null);
        } catch (err) {
          console.error('Failed to fetch blog post:', err);
          setError('Failed to load blog post. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchPost();
    }
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter a title for the blog post.');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Please enter content for the blog post.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      if (isEditMode) {
        await updateBlogPost(id, formData);
        setSuccess('Blog post updated successfully!');
      } else {
        const response = await createBlogPost(formData);
        setSuccess('Blog post created successfully!');
        // Navigate to edit mode
        navigate(`/admin/blog/edit/${response.data._id}`);
      }
    } catch (err) {
      console.error('Failed to save blog post:', err);
      setError('Failed to save blog post. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!isEditMode) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      setSaving(true);
      await deleteBlogPost(id);
      navigate('/admin/blog');
    } catch (err) {
      console.error('Failed to delete blog post:', err);
      setError('Failed to delete blog post. Please try again.');
      setSaving(false);
    }
  };
  
  const handlePreview = () => {
    // Store the current form data in session storage for the preview page
    sessionStorage.setItem('blogPreview', JSON.stringify(formData));
    window.open('/admin/blog/preview', '_blank');
  };
  
  if (loading) {
    return (
      <Container>
        <BackButton to="/admin/blog">
          <FaArrowLeft /> Back to Blog Admin
        </BackButton>
        <LoadingMessage>Loading blog post editor...</LoadingMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <BackButton to="/admin/blog">
        <FaArrowLeft /> Back to Blog Admin
      </BackButton>
      
      <EditorHeader>
        <Title>{isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}</Title>
      </EditorHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <EditorForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter blog post title"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="content">Content (HTML)</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter HTML content"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
            />
            <Label htmlFor="published">Published</Label>
          </CheckboxGroup>
          
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="pinned"
              name="pinned"
              checked={formData.pinned}
              onChange={handleChange}
            />
            <Label htmlFor="pinned">Pinned</Label>
          </CheckboxGroup>
        </FormGroup>
        
        <ButtonGroup>
          <PrimaryButton type="submit" disabled={saving}>
            <FaSave /> {saving ? 'Saving...' : 'Save Post'}
          </PrimaryButton>
          
          <SecondaryButton type="button" onClick={handlePreview} disabled={saving || !formData.content}>
            <FaEye /> Preview
          </SecondaryButton>
          
          {isEditMode && (
            <DangerButton type="button" onClick={handleDelete} disabled={saving}>
              <FaTrash /> Delete
            </DangerButton>
          )}
        </ButtonGroup>
      </EditorForm>
    </Container>
  );
};

export default BlogEditor;