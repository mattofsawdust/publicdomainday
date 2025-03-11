import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaGithub, FaTwitter, FaInstagram, FaHeart } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background-color: #f5f5f5;
  padding: 3rem 2rem;
  border-top: 1px solid #e0e0e0;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FooterSection = styled.div``;

const FooterTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1.2rem;
  color: #333;
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li`
  margin-bottom: 0.8rem;
  
  a {
    color: #555;
    text-decoration: none;
    transition: color 0.2s;
    
    &:hover {
      color: #0066cc;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialIcon = styled.a`
  color: #555;
  font-size: 1.4rem;
  transition: color 0.2s;
  
  &:hover {
    color: #0066cc;
  }
`;

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: 3rem auto 0;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
  color: #777;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const HeartIcon = styled(FaHeart)`
  color: #e25555;
  display: inline-block;
  margin: 0 0.3rem;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>Public Domain Day</FooterTitle>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Discover, share, and use beautiful public domain imagery from around the world.
            All images are free from copyright restrictions.
          </p>
          <SocialLinks>
            <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </SocialIcon>
            <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </SocialIcon>
            <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </SocialIcon>
          </SocialLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Community</FooterTitle>
          <FooterLinks>
            <FooterLink>
              <Link to="/about">About Us</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/blog">Blog</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/contributors">Contributors</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/events">Events</Link>
            </FooterLink>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Information</FooterTitle>
          <FooterLinks>
            <FooterLink>
              <Link to="/faq">FAQ</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/license">License Info</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/terms">Terms of Service</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/privacy">Privacy Policy</Link>
            </FooterLink>
          </FooterLinks>
        </FooterSection>
      </FooterContent>
      
      <FooterBottom>
        <div>
          Made with <HeartIcon /> for the public domain
        </div>
        <div>
          © {new Date().getFullYear()} Public Domain Day. All rights relinquished.
        </div>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;