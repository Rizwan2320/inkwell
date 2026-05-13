import { createClient } from '@supabase/supabase-js';

export const STORAGE_BUCKET = 'inkwell-bucket';

// Lazy initialization to avoid build-time errors
let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

export const supabase = {
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, content: any, options: any) => {
        const client = getSupabase();
        return client.storage.from(bucket).upload(path, content, options);
      },
      getPublicUrl: (path: string) => {
        const client = getSupabase();
        return client.storage.from(bucket).getPublicUrl(path);
      },
    }),
  },
};