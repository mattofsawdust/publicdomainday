# PublicDomainDay Server

## Admin User Setup

To create an admin user for secure access to the blog management features:

1. Ensure `NODE_ENV=development` is set in your `.env` file
2. Use the following API call to register an admin user:

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mattofsawdust",
    "email": "matt@sonsofsawdust.com",
    "password": "Matrix2112!"
  }'
```

3. The response will include a JWT token and user information
4. You can now login at the `/admin-login` page with these credentials

## Security Notes

- For production, change `NODE_ENV` to `production` to disable the registration endpoint
- Always use strong, unique passwords for admin accounts
- Regularly update your `JWT_SECRET` in the `.env` file
- Access to admin routes requires a valid JWT token and admin role
