import { useCallback, useEffect, useRef, useState } from 'react';
import { configured, supabase, type Post } from '../lib/supabase';

const isFilePost = (post: Post) => post.type !== 'text' && Boolean(post.file_url);
const COLUMNS = 'id,title,description,type,file_url,thumbnail_url,file_size,mime_type,category,tags,views,downloads,telegram_message_id,created_at,is_visible';
const INITIAL_LIMIT = 100;

export function usePosts(admin = false) {
  const [posts,setPosts] = useState<Post[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [fresh,setFresh] = useState<string|null>(null);
  const request = useRef(0);
  const reload = useCallback(async () => {
    if (!configured) { setError('Configurez Supabase pour afficher les contenus.'); setLoading(false); return; }
    const number = ++request.current;
    const {data,error:fetchError} = await supabase.from('posts').select(COLUMNS).neq('type','text').not('file_url','is',null).order('created_at',{ascending:false}).limit(INITIAL_LIMIT);
    if(number!==request.current)return;
    if(fetchError) setError(fetchError.message);
    else {setPosts((data||[]) as Post[]);setError('')}
    setLoading(false);
  },[]);
  useEffect(()=>{
    void reload();
    if (!configured) return;
    const channel = supabase.channel('atlas-posts').on('postgres_changes',{event:'*',schema:'public',table:'posts'},payload=>{
      if(payload.eventType==='INSERT') {
        const post=payload.new as Post;
        if(isFilePost(post)) {
          setFresh(post.title);
          setPosts(current=>[post,...current.filter(item=>item.id!==post.id)].slice(0,INITIAL_LIMIT));
        }
      } else if(payload.eventType==='UPDATE') {
        const post=payload.new as Post;
        setPosts(current=>isFilePost(post)?current.map(item=>item.id===post.id?post:item):current.filter(item=>item.id!==post.id));
      } else if(payload.eventType==='DELETE') {
        setPosts(current=>current.filter(item=>item.id!==(payload.old as {id?:string}).id));
      }
    }).subscribe();
    return ()=>{request.current++;void supabase.removeChannel(channel)};
  },[reload]);
  return {posts:admin?posts:posts.filter(p=>p.is_visible),loading,error,fresh,setFresh,reload};
}
