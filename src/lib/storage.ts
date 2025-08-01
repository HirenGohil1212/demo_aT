
'use client'; 

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase"; // Use client-side storage
import { v4 as uuidv4 } from "uuid";
import imageCompression from 'browser-image-compression';


/**
 * Compresses an image file on the client-side before uploading.
 * @param file The image file to compress.
 * @returns A promise that resolves with the compressed file.
 */
async function compressImage(file: File): Promise<File> {
    // Don't compress non-image files
    if (!file.type.startsWith('image/')) {
        return file;
    }

    const options = {
        maxSizeMB: 2,          // Increased Max file size in MB for better quality
        maxWidthOrHeight: 2560, // Increased Max width or height for crisper images
        useWebWorker: true,    // Use web workers for better performance
        fileType: 'image/webp', // Use modern, efficient webp format
        initialQuality: 0.8,   // Start with a higher quality setting
    };

    try {
        console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        return compressedFile;
    } catch (error) {
        console.error("Image compression failed:", error);
        // If compression fails, return the original file
        return file;
    }
}


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
    
    // Compress the image before creating a reference name
    const processedFile = await compressImage(file);
    const fileExtension = processedFile.type === 'image/webp' ? '.webp' : file.name.slice(file.name.lastIndexOf('.'));
    
    const storagePath = `${path}/${uuidv4()}${fileExtension}`;
    const storageRef = ref(storage, storagePath);
    
    try {
        // Upload the compressed file's data directly to the cloud
        await uploadBytes(storageRef, processedFile);
        
        // Get the permanent, public download URL for the uploaded file
        const downloadUrl = await getDownloadURL(storageRef);
        
        return downloadUrl;

    } catch (error) {
        console.error(`Firebase Storage upload failed for path: ${storagePath}`, error);
        // Re-throw a more specific error to be caught by the calling component
        throw new Error("Failed to upload file to Firebase Storage.");
    }
};
