import { createClient } from '@supabase/supabase-js';

// モックモード時は env 未設定でも起動できるようダミー値で埋める（通信は発生しない前提）
const isMock = import.meta.env.VITE_MOCK_AUTH === '1';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? (isMock ? 'https://mock.supabase.co' : undefined);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? (isMock ? 'mock-anon-key' : undefined);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
