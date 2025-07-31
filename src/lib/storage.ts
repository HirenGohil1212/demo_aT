
'use client'; 

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

// Uploads a file to Firebase Storage with progress tracking and returns the public download URL.
export function uploadFile(
    file: File, 
    path: string,
    onProgress: (progress: number) => void
): Promise<string> {
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
                // Handle unsuccessful uploads
                console.error("Upload failed:", error);
                switch (error.code) {
                    case 'storage/unauthorized':
                        reject(new Error("You do not have permission to upload files."));
                        break;
                    case 'storage/canceled':
                        reject(new Error("Upload was canceled."));
                        break;
                    case 'storage/unknown':
                        reject(new Error("An unknown error occurred during upload."));
                        break;
                    default:
                        reject(error);
                }
            }, 
            () => {
                // Handle successful uploads on complete
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                }).catch((error) => {
                    console.error("Failed to get download URL:", error);
                    reject(error);
                });
            }
        );
    });
};
