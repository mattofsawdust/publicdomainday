const BlogPost = require('../models/BlogPost');

// Get all published blog posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({ published: true })
      .sort({ pinned: -1, createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single blog post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new blog post
exports.createPost = async (req, res) => {
  try {
    // Check if user has admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create blog posts' });
    }
    
    const { title, content, published, pinned } = req.body;
    
    const newPost = new BlogPost({
      title,
      content,
      published: published !== undefined ? published : true,
      pinned: pinned !== undefined ? pinned : false
    });
    
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a blog post
exports.updatePost = async (req, res) => {
  try {
    // Check if user has admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update blog posts' });
    }
    
    const { title, content, published, pinned } = req.body;
    
    const updatedPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        published,
        pinned
      },
      { new: true }
    );
    
    if (!updatedPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a blog post
exports.deletePost = async (req, res) => {
  try {
    // Check if user has admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete blog posts' });
    }
    
    const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);
    
    if (!deletedPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};