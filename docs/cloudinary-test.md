# Cloudinary Integration Test Guide

This file provides steps to test the Cloudinary integration for profile picture uploads.

## Configuration Check
1. Make sure your `.env` file contains all required Cloudinary credentials:
   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   - NEXT_PUBLIC_CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

## Testing the Upload Widget
1. Start the Next.js development server: `npm run dev`
2. Navigate to the Profile page
3. Click the edit button on your profile
4. Click the pencil icon on the avatar to open the Cloudinary upload widget
5. Select and upload an image
6. Verify that the image appears as your new profile picture
7. Click "Save Changes" and confirm that the image is saved with your profile

## Troubleshooting
If you encounter issues:
1. Check browser console for errors
2. Verify that all environment variables are correctly set
3. Ensure your Cloudinary account has the right permissions
4. Make sure the upload preset exists and is properly configured in your Cloudinary account

## Notes
- The Cloudinary widget is styled with a purple theme to match the application
- Images are uploaded to the 'freelancer-profiles' folder on Cloudinary
- Maximum file size is set to 2MB
- Supported formats: JPEG, PNG, JPG, WEBP
