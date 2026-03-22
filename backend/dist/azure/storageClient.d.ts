<<<<<<< HEAD
/**
 * Local File Storage client wrapper.
 * Replaces Azure Blob Storage for knowledge base document uploads.
 */
declare class StorageService {
    private uploadDir;
    constructor();
    /** Initialize Local Storage. Call once at startup. */
    initialize(): Promise<void>;
    /** Save a file to local disk and return the URL */
    uploadFile(filename: string, buffer: Buffer, contentType: string): Promise<string | null>;
    /** Delete a file from local storage */
    deleteFile(filename: string): Promise<void>;
    isConnected(): boolean;
}
export declare const storageService: StorageService;
export {};
=======
/**
 * Azure Blob Storage client wrapper.
 * Used for uploading knowledge base documents.
 *
 * NOTE: Replace placeholder credentials with real Azure Storage credentials.
 */
declare class StorageService {
    private containerClient;
    /** Initialize Blob Storage client. Call once at startup. */
    initialize(): Promise<void>;
    /** Upload a file to blob storage and return the URL */
    uploadFile(filename: string, buffer: Buffer, contentType: string): Promise<string | null>;
    /** Delete a file from blob storage */
    deleteFile(filename: string): Promise<void>;
    isConnected(): boolean;
}
export declare const storageService: StorageService;
export {};
>>>>>>> pr-3
//# sourceMappingURL=storageClient.d.ts.map