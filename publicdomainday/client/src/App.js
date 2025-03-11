import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Profile from './components/user/Profile';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import EditImage from './pages/EditImage';
import BatchUpload from './pages/BatchUpload';
import ImageDetail from './pages/ImageDetail';
import TrendingPage from './pages/TrendingPage';
// Blog components
import BlogList from './pages/blog/BlogList';
import BlogPost from './pages/blog/BlogPost';
import BlogAdmin from './pages/blog/BlogAdmin';
import BlogEditor from './pages/blog/BlogEditor';
import BlogPreview from './pages/blog/BlogPreview';
import './App.css';

const MainContainer = styled.div`
  min-height: 100vh;
  background-color: #f9f9f9;
`;

// Protected route component
const ProtectedRoute = ({ children, adminRequired = false }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/admin-login" />;
  }
  
  if (adminRequired && (!currentUser.role || currentUser.role !== 'admin')) {
    return <Navigate to="/admin-login" />;
  }
  
  return children;
};

function AppContent() {
  return (
    <MainContainer>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/user/:id" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/edit-image/:id" element={<EditImage />} />
        <Route path="/batch-upload" element={<BatchUpload />} />
        <Route path="/image/:id" element={<ImageDetail />} />
        <Route path="/trending" element={<TrendingPage />} />
        
        {/* Blog routes */}
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        
        {/* Admin login route */}
        <Route path="/admin-login" element={<AdminLoginPage />} />
        
        {/* Admin blog routes */}
        <Route path="/admin/blog" element={
          <ProtectedRoute adminRequired={true}>
            <BlogAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin/blog/new" element={
          <ProtectedRoute adminRequired={true}>
            <BlogEditor />
          </ProtectedRoute>
        } />
        <Route path="/admin/blog/edit/:id" element={
          <ProtectedRoute adminRequired={true}>
            <BlogEditor />
          </ProtectedRoute>
        } />
        <Route path="/admin/blog/preview" element={<BlogPreview />} />
        
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
      <Footer />
    </MainContainer>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
