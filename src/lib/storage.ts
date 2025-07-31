
'use client'; 

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

// Uploads a file to Firebase Storage with progress tracking and returns the public download URL.
export const uploadFile = (
    file: File, 
    path: string,
    onProgress: (progress: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("No file provided for upload."));
        }
        
        const storagePath = `${path}/${uuidv4()}-${file.name}`;
        const storageRef = ref(storage, storagePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            }, 
            (error) => {
                console.error("Upload failed:", error);
                reject(error);
            }, 
            async () => {
                try {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadUrl);
                } catch (error) {
                    console.error("Failed to get download URL:", error);
                    reject(error);
                }
            }
        );
    });
};
