
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { stat } from 'fs/promises';

// This disables the default Next.js body parser to allow FormData to be processed.
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to check if a directory exists
async function directoryExists(dirPath: string) {
    try {
        await stat(dirPath);
        return true;
    } catch (e: any) {
        if (e.code === 'ENOENT') {
            return false;
        }
        throw e;
    }
}


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const uploadPath = formData.get('path') as string || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // For local development, we use the /tmp directory.
    // On a real server, this would be an absolute path to a public directory.
    // e.g., '/home/user/public_html/uploads'
    const serverUploadDir = path.join('/tmp', 'uploads');
    
    // Create the full path including the subdirectory ('products' or 'banners')
    const finalUploadPath = path.join(serverUploadDir, uploadPath);
    
    // Ensure the target directory exists, create it if it doesn't.
    if (!await directoryExists(finalUploadPath)) {
        console.log(`Directory ${finalUploadPath} does not exist, creating it...`);
        await mkdir(finalUploadPath, { recursive: true });
    }
    
    const newFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(finalUploadPath, newFilename);

    // Write the file to the filesystem
    await writeFile(filePath, buffer);
    console.log(`File saved to: ${filePath}`);

    // Construct the public URL
    // This URL construction assumes the 'uploads' directory is directly accessible at the root of your domain.
    const publicUrl = `/uploads/${uploadPath}/${newFilename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Upload API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: `Failed to upload file: ${errorMessage}` }, { status: 500 });
  }
}
