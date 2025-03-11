import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { getAllBlogPosts, deleteBlogPost } from '../../utils/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
`;

const AddButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #0066cc;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0055aa;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const TableHead = styled.thead`
  background-color: #f5f5f5;
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #ddd;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  background-color: white;
  &:hover {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  color: #333;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  background-color: ${props => props.published ? '#d4edda' : '#f8d7da'};
  color: ${props => props.published ? '#155724' : '#721c24'};
`;

const PinnedBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  background-color: #cce5ff;
  color: #004085;
  margin-left: 0.5rem;
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  color: #333;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: none;
  background-color: transparent;
  color: #dc3545;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f8d7da;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.5rem;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
`;

const BlogAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      await deleteBlogPost(id);
      // Refresh the posts list
      fetchPosts();
    } catch (err) {
      console.error('Failed to delete blog post:', err);
      alert('Failed to delete blog post. Please try again.');
    }
  };
  
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
  
  return (
    <Container>
      <Header>
        <Title>Blog Admin</Title>
        <AddButton to="/admin/blog/new">
          <FaPlus /> New Post
        </AddButton>
      </Header>
      
      {posts.length === 0 ? (
        <EmptyState>
          <h2>No blog posts yet</h2>
          <p>Create your first blog post to get started.</p>
        </EmptyState>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Title</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {posts.map(post => (
              <TableRow key={post._id}>
                <TableCell>
                  {post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}
                </TableCell>
                <TableCell>
                  <StatusBadge published={post.published}>
                    {post.published ? 'Published' : 'Draft'}
                  </StatusBadge>
                  {post.pinned && <PinnedBadge>Pinned</PinnedBadge>}
                </TableCell>
                <TableCell>
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell>
                  <ActionGroup>
                    <ActionButton to={`/admin/blog/edit/${post._id}`} title="Edit">
                      <FaEdit />
                    </ActionButton>
                    <ActionButton to={`/blog/${post._id}`} target="_blank" title="View">
                      <FaEye />
                    </ActionButton>
                    <DeleteButton onClick={() => handleDelete(post._id)} title="Delete">
                      <FaTrash />
                    </DeleteButton>
                  </ActionGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Container>
  );
};

export default BlogAdmin;