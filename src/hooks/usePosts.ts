import { useCallback, useEffect, useState } from 'react';
import { configured, supabase, type Post } from '../lib/supabase';

const isFilePost = (post: Post) => post.type !== 'text' && Boolean(post.file_url);

export function usePosts(admin = false) {
  const [posts,setPosts] = useState<Post[]>([]); const [loading,setLoading] = useState(true); const [error,setError] = useState(''); const [fresh,setFresh] = useState<string|null>(null);
  const reload = useCallback(async () => { if (!configured) { setError('Configurez Supabase pour afficher les contenus.'); setLoading(false); return; } const {data,error} = await supabase.from('posts').select('*').neq('type','text').not('file_url','is',null).order('created_at',{ascending:false}).limit(500); if(error) setError(error.message); else {setPosts((data||[]) as Post[]);setError('')} setLoading(false); },[]);
  useEffect(()=>{void reload(); const channel = supabase.channel('atlas-posts').on('postgres_changes',{event:'*',schema:'public',table:'posts'},payload=>{if(payload.eventType==='INSERT' && isFilePost(payload.new as Post)) setFresh((payload.new as Post).title);void reload()}).subscribe(); return ()=>{void supabase.removeChannel(channel)}},[reload]);
  return {posts:admin?posts:posts.filter(p=>p.is_visible),loading,error,fresh,setFresh,reload};
}
