
'use client'; 

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

// Uploads a file directly to Firebase Storage and returns the public download URL.
export const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    // 1. Create a unique path for the file in Firebase Storage
    const storagePath = `${path}/${uuidv4()}-${file.name}`;
    const storageRef = ref(storage, storagePath);

    // 2. Upload the file's raw data directly to the cloud
    await uploadBytes(storageRef, file);

    // 3. Get the permanent, public download URL for the uploaded file
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
};
