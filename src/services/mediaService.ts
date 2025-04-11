
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProgress {
  progress: number;
  url?: string;
  error?: Error;
}

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  contentType?: string;
  upsert?: boolean;
  onProgress?: (progress: number) => void;
  customPath?: string;
}

// Helper function to get appropriate bucket name
const getBucketName = (fileType: 'image' | 'video' | 'document'): string => {
  switch (fileType) {
    case 'image':
      return 'course-images';
    case 'video':
      return 'course-videos';
    case 'document':
      return 'course-documents';
    default:
      return 'course-images';
  }
};

/**
 * Helper function to extract file name from URL
 */
export const getFileNameFromUrl = (url: string): string => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const pathParts = decodedUrl.split('/');
    const fileName = pathParts[pathParts.length - 1].split('?')[0];
    return fileName.length > 30 ? fileName.substring(0, 27) + '...' : fileName;
  } catch (e) {
    return 'file.unknown';
  }
};

/**
 * Initialize storage buckets for development environment
 */
export const initializeStorageBuckets = async (): Promise<void> => {
  try {
    // Check if buckets exist and create them if they don't
    const buckets = ['course-images', 'course-videos', 'course-documents'];
    
    for (const bucket of buckets) {
      const { data, error } = await supabase.storage.getBucket(bucket);
      
      if (error && error.message.includes('The resource was not found')) {
        console.log(`Creating bucket: ${bucket}`);
        await supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: bucket === 'course-videos' ? 104857600 : 10485760,
        });
      }
    }
    
    console.log('Storage buckets initialized successfully');
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
    throw error;
  }
};

/**
 * Get the correct media URL with proper CDN caching and transforms
 */
export const getCorrectMediaUrl = (url: string | null): string => {
  if (!url) return '';
  
  // Already a valid URL, return as is
  if (url.startsWith('http') || url.startsWith('data:')) {
    return url;
  }
  
  // Prepend base URL if it's a relative path
  return url;
};

/**
 * Uploads a file to storage
 */
const uploadFile = async (
  file: File, 
  path: string, 
  options: UploadOptions = {}
): Promise<string> => {
  const { bucket = 'course-images', onProgress } = options;
  
  try {
    if (!file) {
      throw new Error('File is required');
    }

    if (!bucket) {
      throw new Error('Bucket name is required');
    }
    
    if (!path) {
      throw new Error('Path is required');
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: options.upsert ?? false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error instanceof Error ? error : new Error('Unknown error');
  }
};

/**
 * Uploads an image to storage
 */
export const uploadImage = async (
  file: File, 
  userId: string, 
  options: { 
    folder?: string; 
    onProgress?: (progress: number) => void;
    customPath?: string;
  } = {}
): Promise<string> => {
  try {
    if (!file) {
      throw new Error('Image file is required');
    }
    
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    const { folder = 'uploads', onProgress, customPath } = options;
    
    // Generate a UUID for the file name
    const id = uuidv4();
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    const filePath = customPath || `${folder}/${userId}/${fileName}`;
    
    const bucketName = getBucketName('image');
    
    // Report progress if callback is provided
    if (onProgress) {
      // Simulate upload progress since Supabase doesn't provide real-time progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress > 90) {
          clearInterval(interval);
        }
        onProgress(progress);
      }, 300);
    }
    
    const url = await uploadFile(file, filePath, {
      bucket: bucketName,
      onProgress,
      upsert: true,
    });
    
    return url;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error instanceof Error ? error : new Error('Unknown error');
  }
};

/**
 * Uploads a video to storage
 */
export const uploadVideo = async (
  file: File, 
  userId: string, 
  options: { 
    folder?: string; 
    onProgress?: (progress: number) => void;
    customPath?: string;
  } = {}
): Promise<string> => {
  try {
    if (!file) {
      throw new Error('Video file is required');
    }
    
    if (!file.type.startsWith('video/')) {
      throw new Error('File must be a video');
    }
    
    const { folder = 'uploads', onProgress, customPath } = options;
    
    // Generate a UUID for the file name
    const id = uuidv4();
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    const filePath = customPath || `${folder}/${userId}/${fileName}`;
    
    const bucketName = getBucketName('video');
    
    // Report progress if callback is provided
    if (onProgress) {
      // Simulate upload progress since Supabase doesn't provide real-time progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        if (progress > 95) {
          clearInterval(interval);
        }
        onProgress(progress);
      }, 300);
    }
    
    const url = await uploadFile(file, filePath, {
      bucket: bucketName,
      onProgress,
      upsert: true,
    });
    
    return url;
  } catch (error) {
    console.error('Error in uploadVideo:', error);
    throw error instanceof Error ? error : new Error('Unknown error');
  }
};

/**
 * Uploads a document to storage
 */
export const uploadDocument = async (
  file: File, 
  userId: string, 
  options: { 
    folder?: string; 
    onProgress?: (progress: number) => void;
    customPath?: string;
  } = {}
): Promise<string> => {
  try {
    if (!file) {
      throw new Error('Document file is required');
    }
    
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File must be a valid document type');
    }
    
    const { folder = 'uploads', onProgress, customPath } = options;
    
    // Generate a UUID for the file name
    const id = uuidv4();
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    const filePath = customPath || `${folder}/${userId}/${fileName}`;
    
    const bucketName = getBucketName('document');
    
    // Report progress if callback is provided
    if (onProgress) {
      // Simulate upload progress since Supabase doesn't provide real-time progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress > 90) {
          clearInterval(interval);
        }
        onProgress(progress);
      }, 200);
    }
    
    const url = await uploadFile(file, filePath, {
      bucket: bucketName,
      onProgress,
      upsert: true,
    });
    
    return url;
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    throw error instanceof Error ? error : new Error('Unknown error');
  }
};

/**
 * Deletes a file from storage by URL
 */
export const deleteMediaByUrl = async (url: string): Promise<boolean> => {
  try {
    if (!url || !url.includes('storage')) {
      console.warn('Invalid URL or not a storage URL:', url);
      return false;
    }

    // Extract bucket and path from URL
    const urlParts = url.split('/storage/');
    if (urlParts.length < 2) {
      console.warn('Not a valid storage URL:', url);
      return false;
    }

    const storagePath = urlParts[1];
    const [bucket, ...pathParts] = storagePath.split('/');
    const path = pathParts.join('/').split('?')[0]; // Remove query parameters

    if (!bucket || !path) {
      console.warn('Could not extract bucket or path from URL:', url);
      return false;
    }

    console.log('Deleting file:', { bucket, path });
    const { error } = await supabase.storage.from(bucket).remove([path]);
    
    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file by URL:', error);
    return false;
  }
};

// Export the MediaService for backward compatibility
const mediaService = {
  uploadFile,
  uploadImage,
  uploadVideo,
  uploadDocument,
  deleteMediaByUrl,
  getFileNameFromUrl,
  getCorrectMediaUrl,
  initializeStorageBuckets
};

export default mediaService;
