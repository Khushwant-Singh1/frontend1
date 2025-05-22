import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// Helper function to sign Cloudinary upload parameters
export const generateSignature = (folder: string, publicId?: string) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Create the signature object
  const signatureParams = {
    timestamp,
    folder,
    ...(publicId && { public_id: publicId }),
  };

  // Generate the signature
  const signature = cloudinary.utils.api_sign_request(
    signatureParams,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    timestamp,
    signature,
    folder,
    ...(publicId && { publicId }),
  };
};

// Cloudinary upload preset (alternative to signing)
// This is used for the client-side widget
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
