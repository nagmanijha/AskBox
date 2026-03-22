import fs from 'fs';
import path from 'path';
import { logger } from '../config/logger';

/**
 * Local File Storage client wrapper.
 * Replaces Azure Blob Storage for knowledge base document uploads.
 */
class StorageService {
    private uploadDir: string;

    constructor() {
        this.uploadDir = path.join(__dirname, '../../public/uploads');
    }

    /** Initialize Local Storage. Call once at startup. */
    async initialize(): Promise<void> {
        try {
            if (!fs.existsSync(this.uploadDir)) {
                fs.mkdirSync(this.uploadDir, { recursive: true });
            }
            logger.info('Local file storage initialized');
        } catch (error) {
            logger.error('Failed to initialize local file storage', { error });
        }
    }

    /** Save a file to local disk and return the URL */
    async uploadFile(
        filename: string,
        buffer: Buffer,
        contentType: string
    ): Promise<string | null> {
        try {
            // Ensure safe filename
            const safeFilename = path.basename(filename);
            const filepath = path.join(this.uploadDir, safeFilename);
            
            await fs.promises.writeFile(filepath, buffer);
            
            // Return a local URL path
            return `/uploads/${safeFilename}`;
        } catch (error) {
            logger.error('Failed to save file locally', { error, filename });
            throw error;
        }
    }

    /** Delete a file from local storage */
    async deleteFile(filename: string): Promise<void> {
        try {
            const safeFilename = path.basename(filename);
            const filepath = path.join(this.uploadDir, safeFilename);
            
            if (fs.existsSync(filepath)) {
                await fs.promises.unlink(filepath);
            }
        } catch (error) {
            logger.error('Failed to delete file locally', { error, filename });
        }
    }

    isConnected(): boolean {
        return true; // Always connected to local FS
    }
}

export const storageService = new StorageService();
