#!/bin/bash

# PublicDomainDay Backup Script
# This script creates a timestamped backup of the entire application

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Creating backup of PublicDomainDay application...${NC}"

# Get current timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups"
BACKUP_NAME="publicdomainday_backup_${TIMESTAMP}"

# Create backups directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Create the backup
echo -e "${BLUE}Archiving application code...${NC}"
tar --exclude="node_modules" \
    --exclude=".git" \
    --exclude="uploads/*" \
    -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
    publicdomainday/

# Copy the uploaded images separately (they can be large)
echo -e "${BLUE}Backing up uploaded images...${NC}"
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}_uploads"
cp -r server/uploads/* "${BACKUP_DIR}/${BACKUP_NAME}_uploads/" 2>/dev/null || true

# Export MongoDB data if available
if command -v mongodump &> /dev/null; then
    echo -e "${BLUE}Exporting MongoDB data...${NC}"
    mongodump --db publicdomainday --out "${BACKUP_DIR}/${BACKUP_NAME}_db" 2>/dev/null || echo -e "${RED}MongoDB export failed. Is MongoDB running?${NC}"
else
    echo -e "${RED}mongodump not found. Skipping database backup.${NC}"
fi

# Create a README with backup information
cat > "${BACKUP_DIR}/${BACKUP_NAME}_README.md" << EOL
# PublicDomainDay Backup - ${TIMESTAMP}

This backup contains:
- Application source code
- Uploaded images (in separate directory)
- MongoDB database dump (if mongodump was available)

## Restore Instructions

### Source Code
\`\`\`bash
tar -xzf ${BACKUP_NAME}.tar.gz
\`\`\`

### Uploaded Images
\`\`\`bash
cp -r ${BACKUP_NAME}_uploads/* path/to/app/server/uploads/
\`\`\`

### Database (if applicable)
\`\`\`bash
mongorestore ${BACKUP_NAME}_db
\`\`\`

## Application Version
This backup was created on $(date) and represents a stable working version
of the PublicDomainDay application with full image upload and admin functionality.
EOL

echo -e "${GREEN}Backup complete! Files stored in ${BACKUP_DIR}/${BACKUP_NAME}*${NC}"
echo -e "${BLUE}Source code: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz${NC}"
echo -e "${BLUE}Uploads: ${BACKUP_DIR}/${BACKUP_NAME}_uploads/${NC}"
echo -e "${BLUE}Documentation: ${BACKUP_DIR}/${BACKUP_NAME}_README.md${NC}"