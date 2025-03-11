import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getAllBlogPosts } from '../../utils/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const BlogPostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const BlogPostCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-3px);
  }
`;

const PostTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
  
  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      color: #0066cc;
    }
  }
`;

const PostDate = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const PinnedLabel = styled.span`
  background-color: #0066cc;
  color: white;
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-left: 1rem;
`;

const PostContent = styled.div`
  margin-top: 1rem;
  line-height: 1.6;
  color: #555;
`;

const ReadMore = styled(Link)`
  display: inline-block;
  margin-top: 1rem;
  color: #0066cc;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
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

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getAllBlogPosts();
        setPosts(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
        setError('Failed to load blog posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading blog posts...</LoadingMessage>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }
  
  if (posts.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Blog</Title>
        </Header>
        <p>No blog posts yet. Check back later!</p>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <Title>Blog</Title>
      </Header>
      
      <BlogPostsList>
        {posts.map(post => (
          <BlogPostCard key={post._id}>
            <PostTitle>
              <Link to={`/blog/${post._id}`}>{post.title}</Link>
              {post.pinned && <PinnedLabel>Pinned</PinnedLabel>}
            </PostTitle>
            
            <PostDate>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </PostDate>
            
            <PostContent dangerouslySetInnerHTML={{ __html: truncateHtml(post.content, 300) }} />
            
            <ReadMore to={`/blog/${post._id}`}>Read more →</ReadMore>
          </BlogPostCard>
        ))}
      </BlogPostsList>
    </Container>
  );
};

// Helper function to truncate HTML content
const truncateHtml = (html, maxLength) => {
  // Simple HTML truncation, may not work perfectly for all cases
  const stripped = html.replace(/<[^>]*>/g, '');
  if (stripped.length <= maxLength) return html;
  
  return stripped.substring(0, maxLength) + '...';
};

export default BlogList;