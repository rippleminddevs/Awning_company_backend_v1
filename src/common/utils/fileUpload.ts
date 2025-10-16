import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
// import AWS from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from "@aws-sdk/lib-storage";
import fs from 'fs';
import path from 'path';
import { config } from '../../services/configService';
import { randomUUID } from 'crypto';

// AWS S3 Configuration
// const s3 = new AWS.S3({
//   accessKeyId: config.upload.aws.accessKeyId,
//   secretAccessKey: config.upload.aws.secretAccessKey,
//   region: config.upload.aws.region,
// });

let s3: S3Client | null = null;

if (
  config.upload.aws.accessKeyId &&
  config.upload.aws.secretAccessKey &&
  config.upload.aws.region
) {
  s3 = new S3Client({
    region: config.upload.aws.region,
    credentials: {
      accessKeyId: config.upload.aws.accessKeyId,
      secretAccessKey: config.upload.aws.secretAccessKey,
    },
  });
} else {
  console.warn("⚠️ AWS credentials or region not configured. S3 operations will be skipped.");
}


const BUCKET_NAME = config.upload.aws.bucketName;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: config.upload.cloudinary.cloudName,
  api_key: config.upload.cloudinary.apiKey,
  api_secret: config.upload.cloudinary.apiSecret,
});

// Local Upload Directory Setup
const UPLOAD_DIR = path.join(process.cwd(), 'static', config.upload.uploadDir);
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const DEFAULT_STORAGE_TYPE = config.upload.uploadType || 'local';

/**
 * Converts a ReadableStream to a Buffer (for handling large files efficiently).
 */
const streamToBuffer = async (stream: any): Promise<Buffer> => {
  if (Buffer.isBuffer(stream)) {
    return stream; // Already a buffer, return as-is
  }

  if (typeof stream.pipe !== 'function') {
    throw new Error('Invalid stream: Expected a ReadableStream or Buffer.');
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

/**
 * Extracts the domain and path from a given file URL.
 * @param fileUrl - The full URL of the file
 * @returns An object containing the domain and path
 */
const extractFilePath = (fileUrl: string): { domain: string; path: string; url: string } => {
  const urlObj = new URL(fileUrl);
  return { domain: urlObj.origin, path: urlObj.pathname, url: fileUrl };
};

/**
 * Uploads a single file to the specified storage type.
 * @param file - { name, stream, mimetype } - The file to upload. mimetype is used to determine resource_type for Cloudinary
 * @param storageType - 'local' | 'cloudinary' | 's3'
 * @returns File URL or local file path
 */
export const uploadFile = async (
  file: { name: string; stream: NodeJS.ReadableStream; mimetype?: string },
  storageType = DEFAULT_STORAGE_TYPE
): Promise<{ domain: string; path: string; url: string }> => {
  try {
    const buffer = await streamToBuffer(file.stream);

    // Get the correct extension based on MIME type
    const mimeToExt: { [key: string]: string } = {
      // 🎵 Audio
      'audio/mpeg': '.mp3',
      'audio/mp3': '.mp3',
      'audio/wav': '.wav',
      'audio/ogg': '.ogg',
      'audio/x-m4a': '.m4a',
      'audio/webm': '.webm',
      'audio/aac': '.aac',

      // 🎞️ Video
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/quicktime': '.mov',
      'video/x-msvideo': '.avi',
      'video/3gpp': '.3gp',
      'video/x-matroska': '.mkv',

      // 🖼️ Image
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff',
      'image/heic': '.heic',
      'image/heif': '.heif',

      // 📄 Document
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/json': '.json',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'application/vnd.ms-powerpoint': '.ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
      'text/plain': '.txt',
    };

    const extension = file.mimetype ? mimeToExt[file.mimetype] : path.extname(file.name);
    const uniqueFileName = `${randomUUID()}${extension}`;

    switch (storageType) {
      case 'cloudinary': {
        let resourceType: 'raw' | 'auto' | 'image' | 'video' = 'image';

        if (file.mimetype) {
          if (file.mimetype.startsWith('audio/')) {
            resourceType = 'video';
          } else if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
          } else if (
            file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/json' ||
            file.mimetype.includes('document') ||
            file.mimetype.includes('text/')
          ) {
            resourceType = 'raw';
          }
        }

        const originalNameWithoutExt = path.parse(file.name).name.replace(/[^a-zA-Z0-9-_]/g, '_');
        const extension = file.mimetype ? mimeToExt[file.mimetype] : path.extname(file.name);
        const uniquePrefix = randomUUID().split('-')[0];
        const fileNameWithOriginal = `${uniquePrefix}-${originalNameWithoutExt}`;

        return new Promise((resolve, reject) => {
          const cloudStream = cloudinary.uploader.upload_stream(
            {
              folder: config.upload.uploadDir,
              resource_type: resourceType,
              use_filename: true,
              unique_filename: false,
              public_id: `${config.upload.uploadDir}/${fileNameWithOriginal}`,
              format: extension.replace('.', ''),
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(extractFilePath(result?.secure_url || ''));
            }
          );
          streamifier.createReadStream(buffer).pipe(cloudStream);
        });
      }
      case 's3': {
        // const s3Params = {
        //   Bucket: BUCKET_NAME,
        //   Key: `${config.upload.uploadDir}/${uniqueFileName}`,
        //   Body: buffer,
        //   ContentType: 'application/octet-stream',
        // };
        // const uploadResult = await s3.upload(s3Params).promise();
        // return extractFilePath(uploadResult.Location);
        if (!s3) {
          throw new Error("AWS S3 is not properly configured.");
        }

        const upload = new Upload({
          client: s3,
          params: {
            Bucket: BUCKET_NAME,
            Key: `${config.upload.uploadDir}/${uniqueFileName}`,
            Body: buffer,
            ContentType: 'application/octet-stream',
          },
        });

        const uploadResult = await upload.done();
        if (!uploadResult.Location) {
          throw new Error("Upload failed: S3 did not return a file location.");
        }
        return extractFilePath(uploadResult.Location);
      }
      case 'local':
      default: {
        return new Promise((resolve, reject) => {
          const filePath = path.join(UPLOAD_DIR, uniqueFileName);
          fs.writeFile(filePath, buffer, err => {
            if (err) return reject(err);
            resolve(
              extractFilePath(
                `${config.app.url}/static/${config.upload.uploadDir}/${uniqueFileName}`
              )
            );
          });
        });
      }
    }
  } catch (error: any) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Uploads multiple files to the specified storage type.
 * @param files - Array of { name, stream }
 * @param storageType - 'local' | 'cloudinary' | 's3'
 * @returns Array of file URLs/paths
 */
export const uploadFiles = async (
  files: { name: string; stream: NodeJS.ReadableStream }[],
  storageType = DEFAULT_STORAGE_TYPE
): Promise<{ domain: string; path: string; url: string }[]> => {
  return Promise.all(files.map(file => uploadFile(file, storageType)));
};
