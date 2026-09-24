import { FileText, Headphones, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import type { Post } from '../lib/supabase';
import { TextFileViewer } from './TextFileViewer';

const isTxt = (post: Post) => post.type === 'other' && Boolean(post.file_url) && (/\.txt(?:$|[?#])/i.test(post.file_url || '') || /^text\/plain(?:;|$)/i.test(post.mime_type || ''));

export function FilePreview({post}: {post: Post}) {
  const [zoom,setZoom] = useState(false);
  const url=post.file_url;
  return <><div className="mt-9 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"><div className="flex min-h-70 items-center justify-center bg-[var(--muted)]">
    {isTxt(post)&&url?<TextFileViewer fileUrl={url} title={post.title}/>:post.type==='pdf'&&url?<iframe title={'PDF : '+post.title} src={url+'#toolbar=1'} className="h-[70vh] w-full"/>:post.type==='video'&&url?<video src={url} controls preload="metadata" className="max-h-[70vh] w-full"/>:post.type==='audio'&&url?<div className="w-full p-8 text-center"><Headphones className="mx-auto mb-5 text-indigo-500" size={60}/><audio src={url} controls preload="metadata" className="w-full" aria-label={post.title}/></div>:post.type==='image'&&url?<button onClick={()=>setZoom(true)} aria-label="Agrandir l'image" className="relative"><img src={url} alt={post.title} className="max-h-[75vh] w-full object-contain"/><ZoomIn className="absolute bottom-4 right-4 rounded-lg bg-white p-1 text-slate-900" size={30}/></button>:<div className="p-8 text-center"><FileText size={70} className="mx-auto text-indigo-400"/><p className="mt-4 text-sm text-[var(--soft)]">Aperçu non disponible pour ce format. Vous pouvez télécharger le fichier.</p></div>}
  </div></div>{zoom&&url&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-6" onClick={()=>setZoom(false)} role="dialog" aria-modal="true" aria-label="Image agrandie"><button className="absolute right-5 top-5 text-white" aria-label="Fermer" onClick={()=>setZoom(false)}>Fermer</button><img className="max-h-full max-w-full object-contain" src={url} alt={post.title}/></div>}</>;
}
