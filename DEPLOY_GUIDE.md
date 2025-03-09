
# Deployment Guide for Shared Hosting

This guide will help you deploy the AgroRota application to shared hosting environments like Hostgator, cPanel, or similar services.

## Prerequisites

- A shared hosting account with:
  - PHP support (for .htaccess processing)
  - Node.js access (for building the app locally)
  - FTP/SFTP access or File Manager access

## Step 1: Build the application

1. On your local machine, open a terminal in the project root directory
2. Run the build command:
   ```
   npm run build
   ```
3. This will create a `dist` folder with all the optimized files

## Step 2: Upload files to hosting

### Using FTP/SFTP
1. Connect to your hosting using an FTP client (FileZilla, Cyberduck, etc.)
2. Navigate to your web root folder (often called `public_html`, `www`, or `htdocs`)
3. Upload all the contents of the `dist` folder to this directory

### Using cPanel File Manager
1. Log in to your cPanel account
2. Open the File Manager
3. Navigate to your web root folder
4. Upload the contents of the `dist` folder (you may need to zip the files first and then extract them)

## Step 3: Configure the server

The project includes a `.htaccess` file in the `dist` folder that handles routing for the Single Page Application. Make sure this file is properly uploaded and that your hosting supports `.htaccess` files.

If you're uploading to a subdirectory instead of the root domain:

1. Edit the `vite.config.ts` file locally and update the `base` option to match your subdirectory path, e.g.: `base: "/your-subdirectory/"`
2. Rebuild the application
3. Upload the new build to your subdirectory

## Step 4: Test the application

Access your website through your domain name and verify that:
- The homepage loads correctly
- All routes work (try navigating to different pages)
- Images and other assets load properly

## Troubleshooting

### Routes not working
- Ensure the `.htaccess` file was uploaded properly
- Check if your hosting supports URL rewriting
- Contact your hosting provider to enable mod_rewrite if needed

### Assets not loading
- Check browser console for 404 errors
- Verify path structure in the uploaded files
- Make sure file permissions are set correctly (usually 644 for files, 755 for directories)

### White screen or errors
- Check browser console for JavaScript errors
- Enable error reporting in your hosting to see PHP errors
- Verify your hosting meets all requirements

## Optimizations

For better performance on shared hosting:
- Enable GZIP compression (usually set in cPanel)
- Set up proper caching (as defined in the `.htaccess` file)
- Consider using a CDN for static assets

