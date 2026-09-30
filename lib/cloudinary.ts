import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;


/**
 * Cloudinary URL থেকে publicId বের করার রিইউজেবল ফাংশন
 * Example: "https://res.cloudinary.com/demo/image/upload/v1234567890/profile_images/sample.jpg"
 * Output: "profile_images/sample"
 */
export const extractPublicId = (url: string): string | null => {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const filenameWithExt = parts.pop();
    const folder = parts.pop();
    
    if (!filenameWithExt || !folder) return null;
    
    const filename = filenameWithExt.split('.')[0];
    return `${folder}/${filename}`;
  } catch {
    return null;
  }
};
export const uploadImage = async (filePath: string, folder: string) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
        });
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
};
export const deleteImage = async (publicId: string) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};
export const getImageUrl = (publicId: string) => {
    return cloudinary.url(publicId, {
        secure: true,
    });
};
export const getImageDetails = async (publicId: string) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return result;
    } catch (error) {
        console.error('Error fetching image details from Cloudinary:', error);
        throw error;
    }
};
export const listImages = async (folder: string) => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folder,
        });
        return result.resources;
    } catch (error) {
        console.error('Error listing images from Cloudinary:', error);
        throw error;
    }
};