
# Deployment Guide for Shared Hosting (Hostgator, etc.)

This guide will help you deploy this React application to a shared hosting environment like Hostgator.

## Step 1: Build the Application

First, build the application by running:

```bash
npm run build
```

This will create a `dist` folder containing all the files needed for deployment.

## Step 2: Upload Files to Your Hosting

1. Connect to your shared hosting using FTP/SFTP client (like FileZilla)
2. Navigate to your public directory (usually `public_html`, `www`, or a subdomain folder)
3. Upload all contents from the `dist` folder to this directory

## Step 3: Configure .htaccess for SPAs

For a Single Page Application to work properly on Apache servers (common in shared hosting), create or modify an `.htaccess` file in your public directory with the following content:

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

This ensures that all routes are redirected to your index.html file, allowing your React Router to handle the routing.

## Step 4: Troubleshooting

If you encounter issues:

1. **Blank screen**: Check browser console for path-related errors. You might need to adjust the `base` path in `vite.config.ts` if your site is in a subdirectory.

2. **404 errors**: Ensure your `.htaccess` file is properly uploaded and the server supports mod_rewrite.

3. **API connection issues**: Update your Supabase client configuration if your API endpoints have changed.

4. **Missing assets**: Make sure all files were uploaded correctly, including images and fonts.

## Need Help?

If you encounter specific issues during deployment, check your hosting provider's documentation for any special requirements or contact their support team.
