import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  
  &:hover {
    color: #0066cc;
  }
`;

const EditButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #0066cc;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0055aa;
  }
`;

const PreviewBanner = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #6c757d;
  font-weight: 500;
`;

const PostTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const PostContent = styled.div`
  line-height: 1.8;
  color: #444;
  font-size: 1.1rem;
  
  h2 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-size: 1.8rem;
  }
  
  h3 {
    margin-top: 1.8rem;
    margin-bottom: 0.8rem;
    font-size: 1.5rem;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
  
  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  img {
    max-width: 100%;
    height: auto;
    margin: 1.5rem 0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    border-left: 5px solid #0066cc;
    background-color: #f8f9fa;
    font-style: italic;
  }
  
  code {
    background-color: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: monospace;
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 5px;
    margin-bottom: 1.5rem;
    overflow-x: auto;
    
    code {
      background-color: transparent;
      padding: 0;
    }
  }
  
  a {
    color: #0066cc;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
    
    th, td {
      border: 1px solid #ddd;
      padding: 0.5rem;
    }
    
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  }
`;

const NoPreviewMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 2rem;
  border-radius: 4px;
  text-align: center;
`;

const BlogPreview = () => {
  const [previewData, setPreviewData] = useState(null);
  
  useEffect(() => {
    // Get preview data from session storage
    const data = sessionStorage.getItem('blogPreview');
    if (data) {
      try {
        setPreviewData(JSON.parse(data));
      } catch (err) {
        console.error('Failed to parse preview data:', err);
      }
    }
  }, []);
  
  const handleEditClick = () => {
    window.close(); // Close the preview window
  };
  
  if (!previewData) {
    return (
      <Container>
        <NoPreviewMessage>
          <h2>No preview data found</h2>
          <p>Please return to the blog editor and try again.</p>
        </NoPreviewMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <BackButton to="/admin/blog">
          <FaArrowLeft /> Back to Admin
        </BackButton>
        <EditButton onClick={handleEditClick}>
          <FaEdit /> Edit Post
        </EditButton>
      </Header>
      
      <PreviewBanner>
        Preview Mode - This post is not yet published
      </PreviewBanner>
      
      <PostTitle>{previewData.title}</PostTitle>
      
      <PostContent dangerouslySetInnerHTML={{ __html: previewData.content }} />
    </Container>
  );
};

export default BlogPreview;