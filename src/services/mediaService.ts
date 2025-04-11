
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProgress {
  progress: number;
  url?: string;
  error?: Error;
}

export interface UploadOptions {
  bucket: string;
  folder?: string;
  contentType?: string;
  upsert?: boolean;
  onProgress?: (progress: number) => void;
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

class MediaService {
  private isValidBucketFolder(folder: string): boolean {
    if (!folder) return false;
    const validPattern = /^[a-zA-Z0-9-_/]+$/;
    return validPattern.test(folder) && !folder.includes('..');
  }
  
  private getFilePath(folder: string | undefined, fileName: string): string {
    const sanitizedFolder = folder 
      ? this.isValidBucketFolder(folder) 
        ? folder.endsWith('/') ? folder : `${folder}/` 
        : ''
      : '';
    
    return `${sanitizedFolder}${fileName}`;
  }

  /**
   * Uploads a file to storage
   */
  async uploadFile(
    file: File, 
    path: string, 
    options: UploadOptions
  ): Promise<{ url: string; path: string; error?: Error }> {
    const { bucket, onProgress } = options;
    
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
  
      // Create random filename if needed with same extension
      // const fileExt = file.name.split('.').pop();
      // const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
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
  
      return { 
        url: urlData.publicUrl, 
        path: data.path
      };
    } catch (error) {
      console.error('Error in uploadFile:', error);
      return { 
        url: '', 
        path: '', 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  }

  /**
   * Uploads an image to storage
   */
  async uploadImage(
    file: File, 
    userId: string, 
    options: { 
      folder?: string; 
      onProgress?: (progress: number) => void 
    } = {}
  ): Promise<{ url: string; path: string; error?: Error }> {
    try {
      if (!file) {
        throw new Error('Image file is required');
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      const { folder = 'uploads', onProgress } = options;
      
      // Generate a UUID for the file name
      const id = uuidv4();
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}.${fileExt}`;
      const filePath = this.getFilePath(folder, fileName);
      
      const bucketName = getBucketName('image');
      
      return await this.uploadFile(file, filePath, {
        bucket: bucketName,
        onProgress,
        upsert: true,
      });
    } catch (error) {
      console.error('Error in uploadImage:', error);
      return { 
        url: '', 
        path: '', 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  }

  /**
   * Uploads a video to storage
   */
  async uploadVideo(
    file: File, 
    userId: string, 
    options: { 
      folder?: string; 
      onProgress?: (progress: number) => void 
    } = {}
  ): Promise<{ url: string; path: string; error?: Error }> {
    try {
      if (!file) {
        throw new Error('Video file is required');
      }
      
      if (!file.type.startsWith('video/')) {
        throw new Error('File must be a video');
      }
      
      const { folder = 'uploads', onProgress } = options;
      
      // Generate a UUID for the file name
      const id = uuidv4();
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}.${fileExt}`;
      const filePath = this.getFilePath(folder, fileName);
      
      const bucketName = getBucketName('video');
      
      return await this.uploadFile(file, filePath, {
        bucket: bucketName,
        onProgress,
        upsert: true,
      });
    } catch (error) {
      console.error('Error in uploadVideo:', error);
      return { 
        url: '', 
        path: '', 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  }

  /**
   * Uploads a document to storage
   */
  async uploadDocument(
    file: File, 
    userId: string, 
    options: { 
      folder?: string; 
      onProgress?: (progress: number) => void 
    } = {}
  ): Promise<{ url: string; path: string; error?: Error }> {
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
      
      const { folder = 'uploads', onProgress } = options;
      
      // Generate a UUID for the file name
      const id = uuidv4();
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}.${fileExt}`;
      const filePath = this.getFilePath(folder, fileName);
      
      const bucketName = getBucketName('document');
      
      return await this.uploadFile(file, filePath, {
        bucket: bucketName,
        onProgress,
        upsert: true,
      });
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      return { 
        url: '', 
        path: '', 
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Deletes a file from storage
   */
  async deleteFile(path: string, bucket: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      
      if (error) {
        console.error('Error deleting file:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteFile:', error);
      return false;
    }
  }

  /**
   * Gets a public URL for a file
   */
  getPublicUrl(path: string, bucket: string): string {
    try {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting public URL:', error);
      return '';
    }
  }
}

export const mediaService = new MediaService();
