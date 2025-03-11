#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Public Domain Day project...${NC}"

# Create main project directory
mkdir publicdomainday
cd publicdomainday

# Create frontend (React)
echo -e "${GREEN}Creating React frontend...${NC}"
npx create-react-app client
cd client

# Install frontend dependencies
echo -e "${GREEN}Installing frontend dependencies...${NC}"
npm install \
  axios \
  styled-components \
  react-router-dom \
  react-masonry-css \
  react-icons \
  react-loading-skeleton

# Create necessary frontend directories
mkdir -p src/components src/pages src/assets src/hooks src/utils

cd ..

# Create backend
echo -e "${GREEN}Creating backend structure...${NC}"
mkdir server
cd server

# Initialize package.json for backend
npm init -y

# Install backend dependencies
echo -e "${GREEN}Installing backend dependencies...${NC}"
npm install \
  express \
  mongoose \
  cors \
  dotenv \
  multer \
  aws-sdk \
  jsonwebtoken \
  bcryptjs \
  express-validator

# Create necessary backend directories
mkdir -p src/controllers src/models src/routes src/middleware src/config uploads

# Create basic environment file
echo -e "${GREEN}Creating .env file...${NC}"
cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/publicdomainday
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_bucket_name
EOL

# Create basic gitignore
cd ..
echo -e "${GREEN}Creating .gitignore...${NC}"
cat > .gitignore << EOL
# dependencies
node_modules/
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# uploads
uploads/*
!uploads/.gitkeep
EOL

# Create docker-compose file
echo -e "${GREEN}Creating docker-compose.yml...${NC}"
cat > docker-compose.yml << EOL
version: '3.8'
services:
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./client:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:5000

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    volumes:
      - ./server:/app
      - /app/node_modules
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/publicdomainday
    depends_on:
      - mongodb

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
EOL

# Create Dockerfile for frontend
echo -e "${GREEN}Creating frontend Dockerfile...${NC}"
cat > client/Dockerfile << EOL
FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOL

# Create Dockerfile for backend
echo -e "${GREEN}Creating backend Dockerfile...${NC}"
cat > server/Dockerfile << EOL
FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
EOL

# Create README
echo -e "${GREEN}Creating README.md...${NC}"
cat > README.md << EOL
# Public Domain Day

A website for sharing and downloading public domain images.

## Setup Instructions

1. Clone this repository
2. Configure environment variables in \`server/.env\`
3. Install dependencies:
   \`\`\`bash
   # Install frontend dependencies
   cd client
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   \`\`\`

4. Start the development servers:
   \`\`\`bash
   # Start with Docker
   docker-compose up

   # Or start manually:
   # Terminal 1 - Frontend
   cd client
   npm start

   # Terminal 2 - Backend
   cd server
   npm start
   \`\`\`

## Environment Variables

Make sure to set up the following environment variables in \`server/.env\`:

- PORT
- MONGODB_URI
- JWT_SECRET
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_BUCKET_NAME
EOL

echo -e "${GREEN}Project setup complete!${NC}"
echo -e "${BLUE}To start development:${NC}"
echo "1. Configure your environment variables in server/.env"
echo "2. Run 'docker-compose up' to start all services"
echo "   Or manually start frontend and backend with 'npm start' in their respective directories"
