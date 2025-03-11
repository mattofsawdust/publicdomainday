// This corrected function should go in the getAllImages function in the imageController.js file

// Add this within the 'if (req.query.tag)' block, replacing the current code
if (req.query.tag) {
  // Exact match (case-sensitive)
  const exactTag = req.query.tag;
  
  // Also try case-insensitive match if needed
  const tagRegex = new RegExp('^' + escapeRegExp(req.query.tag) + '$', 'i');
  
  filter.$or = [
    { tags: exactTag },
    { aiTags: exactTag },
    { tags: tagRegex },
    { aiTags: tagRegex }
  ];
}

// Helper function to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}