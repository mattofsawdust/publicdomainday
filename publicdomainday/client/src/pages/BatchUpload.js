import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUpload, FaTimes, FaCheck, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { uploadImage } from '../utils/api';

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

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => {
    if (props.variant === 'success') return '#28a745';
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
      if (props.variant === 'success') return '#218838';
      if (props.variant === 'secondary') return '#5a6268';
      return '#0055aa';
    }};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const UploadArea = styled.div`
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  background-color: ${props => props.isDragActive ? '#f0f9ff' : '#f9f9f9'};
  transition: all 0.2s;
  
  &:hover {
    border-color: #0066cc;
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #0066cc;
  margin-bottom: 1rem;
`;

const UploadText = styled.div`
  margin-bottom: 1rem;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }
  
  p {
    margin: 0;
    color: #666;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const VisuallyHiddenInput = styled.input`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ImagePreviewCard = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.2s;
  pointer-events: ${props => props.show ? 'auto' : 'none'};
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background-color: ${props => {
    if (props.status === 'success') return 'rgba(40, 167, 69, 0.8)';
    if (props.status === 'error') return 'rgba(220, 53, 69, 0.8)';
    if (props.status === 'uploading') return 'rgba(0, 123, 255, 0.8)';
    return 'rgba(0, 0, 0, 0.6)';
  }};
  color: white;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  cursor: ${props => props.status === 'error' ? 'pointer' : 'default'};
  
  &[data-error]:hover::after {
    content: attr(data-error);
    position: absolute;
    bottom: calc(100% + 5px);
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    max-width: 250px;
    z-index: 10;
    white-space: normal;
    text-align: center;
  }
`;

const StatusIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  animation: ${props => props.spin ? 'spin 1s linear infinite' : 'none'};
`;

const ProgressBar = styled.div`
  height: 5px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 1rem;
`;

const Progress = styled.div`
  height: 100%;
  background-color: #0066cc;
  width: ${props => props.percent}%;
  transition: width 0.3s ease;
`;

const BatchUploadOptions = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
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

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const BatchUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [commonData, setCommonData] = useState({
    author: '',
    publicDomain: true,
    year: '',
    tags: '',
    description: ''
  });
  
  const fileInputRef = useRef();
  const navigate = useNavigate();
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Add new files to the state with preview and status
    const newFiles = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      error: null,
      id: Date.now() + Math.random().toString(36).substring(2, 15),
      title: file.name.split('.')[0].replace(/[-_]/g, ' ')
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      
      const newFiles = droppedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        status: 'pending',
        error: null,
        id: Date.now() + Math.random().toString(36).substring(2, 15),
        title: file.name.split('.')[0].replace(/[-_]/g, ' ')
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleRemoveFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCommonData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const uploadBatch = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    // Test server connectivity first
    try {
      console.log('Testing server connectivity before batch upload...');
      const response = await fetch('http://localhost:5001/health');
      if (!response.ok) {
        throw new Error(`Server health check failed: ${response.status}`);
      }
      const healthData = await response.text();
      console.log('Server health check:', healthData);
    } catch (err) {
      console.error('Server connectivity test failed:', err);
      alert(`Cannot connect to server. Make sure the server is running at http://localhost:5001. Error: ${err.message}`);
      setUploading(false);
      return;
    }
    
    const totalFiles = files.length;
    let completedFiles = 0;
    
    // Create a copy of files to avoid modifying state directly during iteration
    const filesCopy = [...files];
    
    for (let i = 0; i < filesCopy.length; i++) {
      const fileData = filesCopy[i];
      
      // Update file status to uploading
      setFiles(prev => 
        prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'uploading' } : f
        )
      );
      
      try {
        console.log(`Uploading file ${i+1}/${totalFiles}: ${fileData.title}`);
        
        // Check file type before trying to upload
        const fileExtension = fileData.file.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        
        if (!allowedExtensions.includes(fileExtension)) {
          throw new Error(`File type not allowed: .${fileExtension}. Supported formats: ${allowedExtensions.join(', ')}`);
        }
        
        // Check file size before trying to upload
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (fileData.file.size > maxSize) {
          throw new Error(`File too large: ${(fileData.file.size / (1024 * 1024)).toFixed(2)}MB. Maximum size: 10MB`);
        }
        
        // Add timeout handling
        const uploadPromise = uploadImage({
          file: fileData.file,
          title: fileData.title,
          description: commonData.description,
          author: commonData.author,
          year: commonData.year,
          publicDomain: commonData.publicDomain,
          tags: commonData.tags
        });
        
        // Set a timeout for the upload (3 minutes)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Upload timed out after 3 minutes')), 180000);
        });
        
        // Race the upload against the timeout
        await Promise.race([uploadPromise, timeoutPromise]);
        
        // Update file status to success
        setFiles(prev => 
          prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'success' } : f
          )
        );
      } catch (err) {
        console.error('Failed to upload file:', err);
        
        // Get a more meaningful error message
        let errorMessage = 'Unknown upload error';
        
        // Try to extract specific error messages
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        // Update file status to error
        setFiles(prev => 
          prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'error', error: errorMessage } : f
          )
        );
        
        // Always continue with the next file, don't block the batch
        // But show a non-blocking notification for the current error
        console.error(`Upload failed for ${fileData.title}: ${errorMessage}`);
      }
      
      // Update progress
      completedFiles++;
      setProgress(Math.round((completedFiles / totalFiles) * 100));
    }
    
    setUploading(false);
  };
  
  return (
    <PageContainer>
      <PageHeader>
        <Title>Batch Upload Images</Title>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/admin')}
        >
          <FaArrowLeft /> Back to Dashboard
        </Button>
      </PageHeader>
      
      <UploadArea
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        isDragActive={false}
      >
        <UploadIcon>
          <FaUpload />
        </UploadIcon>
        
        <UploadText>
          <h3>Drop images here or click to browse</h3>
          <p>
            Supports: JPG, PNG, GIF (Max size: 10MB per file)
          </p>
        </UploadText>
        
        <Button>
          Browse Files
        </Button>
        
        <FileInput
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
        />
      </UploadArea>
      
      {files.length > 0 && (
        <>
          <BatchUploadOptions>
            <h3>Batch Properties</h3>
            <p>These properties will be applied to all uploaded images</p>
            
            <FormGroup>
              <Label htmlFor="author">Author/Creator</Label>
              <Input
                type="text"
                id="author"
                name="author"
                value={commonData.author}
                onChange={handleInputChange}
                placeholder="Who created these works"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <Input
                as="textarea"
                id="description"
                name="description"
                value={commonData.description}
                onChange={handleInputChange}
                placeholder="Description of these images"
                style={{ minHeight: '100px', fontFamily: 'inherit' }}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="year">Year</Label>
              <Input
                type="number"
                id="year"
                name="year"
                value={commonData.year}
                onChange={handleInputChange}
                placeholder="Year of creation"
                min="1"
                max={new Date().getFullYear()}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="tags">Common Tags (comma separated)</Label>
              <Input
                type="text"
                id="tags"
                name="tags"
                value={commonData.tags}
                onChange={handleInputChange}
                placeholder="art, painting, landscape"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>
                <Checkbox
                  type="checkbox"
                  name="publicDomain"
                  checked={commonData.publicDomain}
                  onChange={handleInputChange}
                />
                All works are in the public domain
              </Label>
            </FormGroup>
          </BatchUploadOptions>
          
          <h3>Selected Images ({files.length})</h3>
          
          <PreviewGrid>
            {files.map((file) => (
              <ImagePreviewCard key={file.id}>
                <PreviewImage src={file.preview} alt={file.title} />
                
                <RemoveButton 
                  onClick={() => handleRemoveFile(file.id)}
                  disabled={uploading}
                >
                  <FaTimes />
                </RemoveButton>
                
                {file.status !== 'pending' && (
                  <StatusIndicator 
                    status={file.status} 
                    data-error={file.status === 'error' ? file.error : ''}
                    onClick={() => file.status === 'error' && alert(`Upload Error: ${file.error}`)}
                  >
                    <StatusIcon spin={file.status === 'uploading'}>
                      {file.status === 'success' && <FaCheck />}
                      {file.status === 'error' && <FaTimes />}
                      {file.status === 'uploading' && <FaSpinner />}
                    </StatusIcon>
                    {file.status === 'success' && 'Uploaded'}
                    {file.status === 'error' && 'Failed - Click for details'}
                    {file.status === 'uploading' && 'Uploading...'}
                  </StatusIndicator>
                )}
              </ImagePreviewCard>
            ))}
          </PreviewGrid>
          
          {uploading && (
            <ProgressBar>
              <Progress percent={progress} />
            </ProgressBar>
          )}
          
          <ActionButtons>
            <Button 
              variant="secondary" 
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear All
            </Button>
            <Button 
              variant="success" 
              onClick={uploadBatch}
              disabled={uploading || files.length === 0}
            >
              {uploading ? (
                <>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  Uploading ({progress}%)
                </>
              ) : (
                <>
                  <FaUpload /> Upload {files.length} Images
                </>
              )}
            </Button>
          </ActionButtons>
        </>
      )}
    </PageContainer>
  );
};

export default BatchUpload;