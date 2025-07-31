
'use server'; 

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase-admin"; // Use admin storage on the server
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a file to a specified path in Firebase Storage.
 * This function should only be called from Server Actions.
 * @param file The file object to upload.
 * @param path The folder path in storage (e.g., 'banners', 'products').
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!file || file.size === 0) {
        throw new Error("No file provided or file is empty.");
    }
    
    // Convert file to buffer for admin SDK
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `${path}/${uuidv4()}-${file.name}`;
    const bucket = storage.bucket();
    const fileInBucket = bucket.file(storagePath);
    
    try {
        // Upload the file buffer to the cloud
        await fileInBucket.save(fileBuffer, {
            metadata: {
                contentType: file.type,
            },
        });
        
        // Get the permanent, public download URL for the uploaded file
        // Note: We are getting the URL for the file we just uploaded
        const [downloadUrl] = await fileInBucket.getSignedUrl({
            action: 'read',
            expires: '03-09-2491', // A far-future expiration date
        });
        
        return downloadUrl;

    } catch (error) {
        console.error(`Firebase Storage upload failed for path: ${storagePath}`, error);
        // Re-throw a more specific error to be caught by the calling server action
        throw new Error("Failed to upload file to Firebase Storage.");
    }
};
