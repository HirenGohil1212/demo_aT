
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const serverUploadDir = path.join('/tmp', 'uploads');
    const finalUploadPath = path.join(serverUploadDir, uploadPath);

    if (!await directoryExists(finalUploadPath)) {
      await mkdir(finalUploadPath, { recursive: true });
    }
    
    const newFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(finalUploadPath, newFilename);

    await writeFile(filePath, buffer);

    // This is the key change: Return a URL that points to our new image-serving API
    const publicUrl = `/api/images/${uploadPath}/${newFilename}`;

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error) {
    console.error('Upload API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: `Failed to upload file: ${errorMessage}` }, { status: 500 });
  }
}
