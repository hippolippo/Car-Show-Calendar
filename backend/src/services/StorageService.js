// Storage service - local filesystem for now, easy to switch to R2 later
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local'; // 'local' or 'r2'
const LOCAL_UPLOAD_DIR = path.join(__dirname, '../../uploads');
const PUBLIC_URL_BASE = process.env.PUBLIC_URL_BASE || '';

/**
 * Storage service abstraction
 * Makes it easy to switch from local filesystem to R2/S3
 */
export class StorageService {
  /**
   * Initialize storage (create directories if needed)
   */
  static init() {
    if (STORAGE_TYPE === 'local') {
      // Ensure upload directory exists
      if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
        fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
      }
      console.log('📁 Local storage initialized:', LOCAL_UPLOAD_DIR);
    }
  }

  /**
   * Save a file
   * @param {Buffer} fileBuffer - File data
   * @param {string} filename - Original filename
   * @param {string} mimetype - File MIME type
   * @returns {Promise<string>} - Public URL of the uploaded file
   */
  static async saveFile(fileBuffer, filename, mimetype) {
    if (STORAGE_TYPE === 'local') {
      return this._saveLocal(fileBuffer, filename, mimetype);
    } else if (STORAGE_TYPE === 'r2') {
      return this._saveR2(fileBuffer, filename, mimetype);
    }
    throw new Error('Invalid storage type');
  }

  /**
   * Delete a file
   * @param {string} fileUrl - URL of the file to delete
   * @returns {Promise<boolean>}
   */
  static async deleteFile(fileUrl) {
    if (STORAGE_TYPE === 'local') {
      return this._deleteLocal(fileUrl);
    } else if (STORAGE_TYPE === 'r2') {
      return this._deleteR2(fileUrl);
    }
    return false;
  }

  /**
   * Get storage info for debugging
   */
  static getInfo() {
    return {
      type: STORAGE_TYPE,
      uploadDir: STORAGE_TYPE === 'local' ? LOCAL_UPLOAD_DIR : null,
      publicUrlBase: PUBLIC_URL_BASE
    };
  }

  // ==================== LOCAL STORAGE ====================

  /**
   * Save file to local filesystem
   * @private
   */
  static async _saveLocal(fileBuffer, filename, mimetype) {
    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const safeBasename = basename.replace(/[^a-zA-Z0-9-_]/g, '_');
    const uniqueFilename = `${timestamp}-${safeBasename}${ext}`;
    
    const filepath = path.join(LOCAL_UPLOAD_DIR, uniqueFilename);
    
    // Write file
    await fs.promises.writeFile(filepath, fileBuffer);
    
    // Return relative URL path (will be resolved by backend when serving)
    // Frontend will need to construct full URL with backend hostname
    return `/uploads/${uniqueFilename}`;
  }

  /**
   * Delete file from local filesystem
   * @private
   */
  static async _deleteLocal(fileUrl) {
    try {
      // Extract filename from URL
      const filename = path.basename(fileUrl);
      const filepath = path.join(LOCAL_UPLOAD_DIR, filename);
      
      if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting local file:', error);
      return false;
    }
  }

  // ==================== R2/S3 STORAGE ====================
  // TODO: Implement when moving to production

  /**
   * Save file to Cloudflare R2
   * @private
   */
  static async _saveR2(fileBuffer, filename, mimetype) {
    // TODO: Implement R2 upload
    // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    // const client = new S3Client({
    //   region: 'auto',
    //   endpoint: process.env.R2_ENDPOINT,
    //   credentials: {
    //     accessKeyId: process.env.R2_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    //   }
    // });
    // 
    // const command = new PutObjectCommand({
    //   Bucket: process.env.R2_BUCKET_NAME,
    //   Key: `fliers/${Date.now()}-${filename}`,
    //   Body: fileBuffer,
    //   ContentType: mimetype
    // });
    // 
    // await client.send(command);
    // return `${process.env.R2_PUBLIC_URL}/fliers/${filename}`;
    
    throw new Error('R2 storage not yet implemented. Set STORAGE_TYPE=local');
  }

  /**
   * Delete file from R2
   * @private
   */
  static async _deleteR2(fileUrl) {
    // TODO: Implement R2 delete
    throw new Error('R2 storage not yet implemented');
  }
}

// Initialize storage on module load
StorageService.init();
