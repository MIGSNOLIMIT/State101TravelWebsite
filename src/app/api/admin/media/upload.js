import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const bodySizeLimit = '50mb';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const bucket = 'state101cms'; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('media');
    const uploaded = [];
    for (const file of files) {
      // file is a Blob
      const fileName = file.name || `upload_${Date.now()}`;
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (error) {
        uploaded.push({ file: fileName, error: error.message });
      } else {
        const publicUrl = supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
        uploaded.push({ file: fileName, url: publicUrl });
      }
    }
    return NextResponse.json(uploaded);
  } catch (err) {
    return NextResponse.json({ error: 'Upload failed', details: err.message }, { status: 500 });
  }
}
