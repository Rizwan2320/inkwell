import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, STORAGE_BUCKET } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST /api/upload - Upload an image file to Supabase Storage with local fallback
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Try Supabase Storage first
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (!error && data) {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filename);

        return NextResponse.json({ url: urlData.publicUrl, filename });
      }
    } catch (supabaseError) {
      console.warn('Supabase upload failed, falling back to local storage:', supabaseError);
    }

    // Fallback: Upload to local filesystem
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({ url, filename });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}