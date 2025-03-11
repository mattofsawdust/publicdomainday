# Public Domain Day

A website for sharing and downloading public domain images.

## Setup Instructions

1. Clone this repository
2. Configure environment variables in `server/.env`
3. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd client
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

4. Start the development servers:
   ```bash
   # Start with Docker
   docker-compose up

   # Or start manually:
   # Terminal 1 - Frontend
   cd client
   npm start

   # Terminal 2 - Backend
   cd server
   npm start
   ```

## Environment Variables

Make sure to set up the following environment variables in `server/.env`:

- PORT
- MONGODB_URI
- JWT_SECRET
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_BUCKET_NAME
