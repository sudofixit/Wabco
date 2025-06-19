import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const runtime = 'nodejs';

// Helper function to extract public_id from Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id.extension
    // or: https://res.cloudinary.com/cloud_name/image/upload/public_id.extension
    
    if (!url.includes('cloudinary.com')) {
      return null; // Not a Cloudinary URL
    }
    
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return null;
    }
    
    // Get everything after 'upload/' 
    const afterUpload = urlParts.slice(uploadIndex + 1);
    
    // Remove version if present (starts with 'v' followed by numbers)
    const withoutVersion = afterUpload[0]?.startsWith('v') && /^v\d+$/.test(afterUpload[0]) 
      ? afterUpload.slice(1) 
      : afterUpload;
    
    if (withoutVersion.length === 0) {
      return null;
    }
    
    // Join remaining parts and remove file extension
    const publicIdWithExtension = withoutVersion.join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
}

// Helper function to delete image from Cloudinary
async function deleteCloudinaryImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary deletion result:', result);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Check if Cloudinary credentials are configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary credentials are not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file');
    const oldImageUrl = formData.get('oldImageUrl') as string | null;
    
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Delete old image if provided and it's a Cloudinary URL
    if (oldImageUrl && oldImageUrl.includes('cloudinary.com')) {
      const oldPublicId = extractPublicIdFromUrl(oldImageUrl);
      if (oldPublicId) {
        console.log('Attempting to delete old image with public_id:', oldPublicId);
        const deleteSuccess = await deleteCloudinaryImage(oldPublicId);
        if (deleteSuccess) {
          console.log('Successfully deleted old image:', oldPublicId);
        } else {
          console.warn('Failed to delete old image:', oldPublicId, '- continuing with upload');
        }
      }
    }

    // Convert file to buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          // Let Cloudinary handle format optimization automatically
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    // Return the Cloudinary URL
    return NextResponse.json({ 
      path: (uploadResult as any).secure_url,
      publicId: (uploadResult as any).public_id 
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Handle specific Cloudinary errors
    if (error.message?.includes('Invalid API key')) {
      return NextResponse.json({ error: 'Invalid Cloudinary credentials' }, { status: 500 });
    }
    
    if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
      return NextResponse.json({ error: 'Upload timeout. Please try again.' }, { status: 408 });
    }
    
    if (error.http_code === 401) {
      return NextResponse.json({ error: 'Cloudinary authentication failed' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Upload failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 