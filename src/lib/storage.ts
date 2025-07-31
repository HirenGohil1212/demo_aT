
'use client'; 

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase"; // Use client-side storage
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a file to Firebase Storage from the client-side.
 * This function should be called from client components.
 * @param file The file object to upload.
 * @param path The folder path in storage (e.g., 'banners', 'products').
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    
    const storagePath = `${path}/${uuidv4()}-${file.name}`;
    const storageRef = ref(storage, storagePath);
    
    try {
        // Upload the file's raw data directly to the cloud
        await uploadBytes(storageRef, file);
        
        // Get the permanent, public download URL for the uploaded file
        const downloadUrl = await getDownloadURL(storageRef);
        
        return downloadUrl;

    } catch (error) {
        console.error(`Firebase Storage upload failed for path: ${storagePath}`, error);
        // Re-throw a more specific error to be caught by the calling component
        throw new Error("Failed to upload file to Firebase Storage.");
    }
};
