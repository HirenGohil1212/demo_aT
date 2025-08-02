
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

// This disables the default Next.js body parser to allow FormData to be processed.
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // --- IMPORTANT ---
    // In production on Hostinger, you will change this path to the absolute path
    // of your `public_html/uploads` directory.
    // Example: const serverUploadDir = '/home/u123456789/domains/yourdomain.com/public_html/uploads';
    // For local development, we use the /tmp directory which is generally available.
    const serverUploadDir = path.join('/tmp', 'uploads');

    // Create the full path including the subdirectory ('products' or 'banners')
    const finalUploadPath = path.join(serverUploadDir, uploadPath);
    
    // Ensure the directory exists (this would require 'fs/promises' `mkdir` in a real scenario,
    // but for /tmp it's usually not needed. On a server, you must ensure the dir exists).
    // For simplicity in this example, we assume the base /tmp/uploads directory exists.
    
    const newFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(finalUploadPath, newFilename);

    // Write the file to the filesystem
    // NOTE: This requires 'fs/promises'. In a real server, ensure directory permissions are correct.
    // await mkdir(finalUploadPath, { recursive: true }); // Uncomment this if you need to create subdirectories
    await writeFile(filePath, buffer);
    console.log(`File saved to: ${filePath}`);

    // Construct the public URL
    // This URL construction assumes the 'uploads' directory is directly accessible at the root of your domain.
    const publicUrl = `/uploads/${uploadPath}/${newFilename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}
