
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';
import { stat } from 'fs/promises';
import mime from 'mime-types';

// This route will handle requests for images stored in the /tmp directory.
// e.g. /api/images/products/some-image.jpg

async function fileExists(filePath: string) {
    try {
        await stat(filePath);
        return true;
    } catch (e: any) {
        if (e.code === 'ENOENT') {
            return false;
        }
        throw e;
    }
}


export async function GET(
  request: NextRequest,
  { params }: { params: { segments: string[] } }
) {
  const { segments } = params;

  if (!segments || segments.length === 0) {
    return new NextResponse('Invalid file path', { status: 400 });
  }

  // IMPORTANT: Sanitize the file path to prevent directory traversal attacks.
  const requestedPath = path.normalize(segments.join('/'));
  const basePath = path.resolve('/tmp/uploads');
  const filePath = path.join(basePath, requestedPath);

  // Check that the resolved path is still within the intended directory
  if (!filePath.startsWith(basePath)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    if (!await fileExists(filePath)) {
         return new NextResponse('Image not found', { status: 404 });
    }
    
    const fileBuffer = await readFile(filePath);
    
    // Determine the content type from the file extension
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
