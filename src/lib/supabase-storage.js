import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const mediaBucket = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "state101cms";

let cachedClient;

export function getStorageBucketName() {
  return mediaBucket;
}

export function getStorageClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase storage environment variables are not configured.");
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return cachedClient;
}