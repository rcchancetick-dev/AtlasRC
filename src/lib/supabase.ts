import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured = Boolean(url && key);
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');
export type Post = { id: string; title: string; description: string; type: 'pdf'|'image'|'video'|'audio'|'text'|'other'; file_url: string|null; thumbnail_url: string|null; file_size: number|null; mime_type: string|null; category: string; tags: string[]; views: number; downloads: number; telegram_message_id: number; created_at: string; is_visible: boolean };
export const size = (n: number|null) => n == null ? '—' : n < 1048576 ? `${(n/1024).toFixed(1)} Ko` : `${(n/1048576).toFixed(1)} Mo`;
export const date = (s: string) => new Intl.DateTimeFormat('fr-FR',{dateStyle:'long'}).format(new Date(s));
