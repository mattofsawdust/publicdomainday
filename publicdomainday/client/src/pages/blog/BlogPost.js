import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';
import { getBlogPostById } from '../../utils/api';

const Container = styled.div`
  max-width: 1000px;
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

const PostHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const PostDate = styled.div`
  font-size: 1rem;
  color: #666;
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

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await getBlogPostById(id);
        setPost(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
        setError('Failed to load blog post. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);
  
  if (loading) {
    return (
      <Container>
        <BackButton to="/blog">
          <FaArrowLeft /> Back to Blog
        </BackButton>
        <LoadingMessage>Loading blog post...</LoadingMessage>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <BackButton to="/blog">
          <FaArrowLeft /> Back to Blog
        </BackButton>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }
  
  if (!post) {
    return (
      <Container>
        <BackButton to="/blog">
          <FaArrowLeft /> Back to Blog
        </BackButton>
        <ErrorMessage>Blog post not found</ErrorMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <BackButton to="/blog">
        <FaArrowLeft /> Back to Blog
      </BackButton>
      
      <PostHeader>
        <Title>{post.title}</Title>
        <PostDate>
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </PostDate>
      </PostHeader>
      
      <PostContent dangerouslySetInnerHTML={{ __html: post.content }} />
    </Container>
  );
};

export default BlogPost;