
'use client'; 

import { v4 as uuidv4 } from "uuid";
import imageCompression from 'browser-image-compression';


/**
 * Compresses an image file on the client-side before uploading.
 * @param file The image file to compress.
 * @returns A promise that resolves with the compressed file.
 */
async function compressImage(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) {
        return file;
    }

    const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 2560,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.8,
    };

    try {
        console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        return compressedFile;
    } catch (error) {
        console.error("Image compression failed:", error);
        return file;
    }
}


/**
 * Uploads a file to the server via an API endpoint.
 * @param file The file object to upload.
 * @param path The folder path for organization (e.g., 'banners', 'products').
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    
    const processedFile = await compressImage(file);
    
    // Use FormData to send the file to the API endpoint
    const formData = new FormData();
    formData.append('file', processedFile, processedFile.name);
    formData.append('path', path);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.error || 'File upload failed on the server.');
        }

        const result = await response.json();
        console.log("File uploaded successfully, URL:", result.url);
        return result.url;

    } catch (error) {
        console.error("Error uploading file:", error);
        // Fallback to a placeholder if the upload fails to avoid crashing the app
        return `https://placehold.co/600x400.png?text=Upload+Failed`;
    }
};

