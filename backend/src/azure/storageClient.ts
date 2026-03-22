<<<<<<< HEAD
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
=======
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { config } from '../config';
import { logger } from '../config/logger';

/**
 * Azure Blob Storage client wrapper.
 * Used for uploading knowledge base documents.
 * 
 * NOTE: Replace placeholder credentials with real Azure Storage credentials.
 */
class StorageService {
    private containerClient: ContainerClient | null = null;

    /** Initialize Blob Storage client. Call once at startup. */
    async initialize(): Promise<void> {
        if (!config.storage.connectionString) {
            logger.warn('Azure Storage credentials not configured — uploads will use local storage');
            return;
        }

        try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(
                config.storage.connectionString
            );
            this.containerClient = blobServiceClient.getContainerClient(config.storage.containerName);
            await this.containerClient.createIfNotExists({ access: 'blob' });
            logger.info('Azure Blob Storage client initialized');
        } catch (error) {
            logger.error('Failed to initialize Azure Blob Storage', { error });
        }
    }

    /** Upload a file to blob storage and return the URL */
    async uploadFile(
        filename: string,
        buffer: Buffer,
        contentType: string
    ): Promise<string | null> {
        if (!this.containerClient) {
            logger.warn('Storage not configured — skipping blob upload');
            return null;
        }

        try {
            const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
            await blockBlobClient.upload(buffer, buffer.length, {
                blobHTTPHeaders: { blobContentType: contentType },
            });
            return blockBlobClient.url;
        } catch (error) {
            logger.error('Failed to upload file to blob storage', { error, filename });
            throw error;
        }
    }

    /** Delete a file from blob storage */
    async deleteFile(filename: string): Promise<void> {
        if (!this.containerClient) return;

        try {
            const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
            await blockBlobClient.deleteIfExists();
        } catch (error) {
            logger.error('Failed to delete file from blob storage', { error, filename });
        }
    }

    isConnected(): boolean {
        return this.containerClient !== null;
    }
}

export const storageService = new StorageService();
>>>>>>> pr-3
