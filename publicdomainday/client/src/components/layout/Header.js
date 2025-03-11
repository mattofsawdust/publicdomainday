import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaSignOutAlt, FaUpload, FaCog, FaBlog, FaFire, FaHome } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const HeaderContainer = styled.header`
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #0066cc;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const NavItem = styled(Link)`
  margin-left: 1.5rem;
  color: #555;
  text-decoration: none;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #0066cc;
  }
  
  &::before, 
  &::after {
    content: none !important;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  font-size: 1rem;
  margin-left: 1.5rem;
  padding: 0;
  
  &:hover {
    color: #0066cc;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const UserAvatar = styled.img`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  object-fit: cover;
`;

const UsernameSpan = styled.span`
  display: inline-block;
  color: inherit;
  margin-left: 0.25rem;
`;

// Special nav item for user profile to prevent duplication issues
const UserNavItem = styled(NavItem)`
  && {
    display: flex;
    align-items: center;
    
    &:after, &:before {
      display: none;
    }
    
    > div {
      display: flex;
      align-items: center;
    }
  }
`;

// Styled component for the home button
const HomeButtonStyled = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 1.5rem;
  color: #555;
  font-size: 1rem;
  padding: 0;
  display: flex;
  align-items: center;
  font-family: inherit;
  
  &:hover {
    color: #0066cc;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

// Custom component for Home button to ensure it always clears filters
const HomeButton = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleHomeClick = () => {
    // Always go to home page with no query parameters
    console.log('Home button clicked, clearing all filters');
    
    // First navigate to home without any parameters
    navigate('/', { replace: true });
    
    // Then dispatch a custom event to force the homepage to reload images
    setTimeout(() => {
      const refreshEvent = new CustomEvent('refreshHomeImages');
      window.dispatchEvent(refreshEvent);
      console.log('Dispatched refreshHomeImages event');
    }, 50);
  };
  
  return (
    <HomeButtonStyled onClick={handleHomeClick}>
      {children}
    </HomeButtonStyled>
  );
};

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Custom logo that also clears filters
  const handleLogoClick = (e) => {
    e.preventDefault();
    
    // Navigate to home without parameters
    navigate('/', { replace: true });
    
    // Then dispatch a custom event to force the homepage to reload images
    setTimeout(() => {
      const refreshEvent = new CustomEvent('refreshHomeImages');
      window.dispatchEvent(refreshEvent);
      console.log('Logo clicked: Dispatched refreshHomeImages event');
    }, 50);
  };

  return (
    <HeaderContainer>
      <Logo to="/" onClick={handleLogoClick}>Public Domain Day</Logo>
      
      <Nav>
        {currentUser ? (
          <>
            <HomeButton>
              <FaHome /> Home
            </HomeButton>
            <NavItem to="/blog">
              <FaBlog /> Blog
            </NavItem>
            <NavItem to="/trending">
              <FaFire /> Trending
            </NavItem>
            <NavItem to="/upload">
              <FaUpload /> Upload
            </NavItem>
            <NavItem to="/admin">
              <FaCog /> Manage Images
            </NavItem>
            <NavItem to={`/admin/blog`}>
              <UserAvatar 
                src="/default-avatar.png" 
                alt="Admin" 
              />
            </NavItem>
            <Button onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </Button>
          </>
        ) : (
          <>
            <HomeButton>
              <FaHome /> Home
            </HomeButton>
            <NavItem to="/blog">
              <FaBlog /> Blog
            </NavItem>
            <NavItem to="/trending">
              <FaFire /> Trending
            </NavItem>
            {/* Added Admin link for non-logged in users for simplified approach */}
            <NavItem to="/admin-login">
              <FaCog /> Admin Login
            </NavItem>
            <NavItem to="/batch-upload">
              <FaUpload /> Upload
            </NavItem>
            <NavItem to="/login">Login</NavItem>
            <NavItem to="/register">Register</NavItem>
          </>
        )}
      </Nav>
    </HeaderContainer>
  );
};

export default Header;