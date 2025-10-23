// Usage: node scripts/migrate-to-supabase.js <local-folder>
// Requires: @supabase/supabase-js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const bucket = 'state101cms'; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadFile(filePath) {
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const { error } = await supabase.storage.from(bucket).upload(fileName, fileBuffer, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) {
    console.error(`Failed to upload ${fileName}:`, error.message);
  } else {
    console.log(`Uploaded: ${fileName}`);
  }
}

async function main() {
  const folder = process.argv[2];
  if (!folder) {
    console.error('Usage: node scripts/migrate-to-supabase.js <local-folder>');
    process.exit(1);
  }
  const files = fs.readdirSync(folder);
  for (const file of files) {
    const filePath = path.join(folder, file);
    if (fs.statSync(filePath).isFile()) {
      await uploadFile(filePath);
    }
  }
  console.log('Migration complete!');
}

main();
