import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDownToLine, Check, ChevronLeft, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { PostCard } from '../components/PostCard';
import { FilePreview } from '../components/FilePreview';
import { supabase, type Post, size, date } from '../lib/supabase';

function downloadUrl(fileUrl: string) { const url = new URL(fileUrl); url.searchParams.set('download',''); return url.toString(); }

export function ContentDetail({posts,loading}:{posts:Post[];loading:boolean}) {
  const {id}=useParams();
  const post=posts.find(p=>p.id===id);
  const [copied,setCopied]=useState(false);
  useEffect(()=>{if(!post)return;document.title=post.title+' — AtlasRC';document.querySelector('meta[name="description"]')?.setAttribute('content',post.description||post.title);void supabase.rpc('increment_post_counter',{post_id:post.id,counter:'views'});return()=>{document.title='AtlasRC — La bibliothèque qui avance avec vous'}},[post?.id]);
  if(loading)return <div className="container py-20"><div className="h-88 animate-pulse rounded-2xl bg-[var(--muted)]"/></div>;
  if(!post)return <div className="container flex min-h-[65vh] flex-col items-center justify-center text-center"><h1 className="text-3xl font-extrabold">Fichier introuvable</h1><p className="mt-3 text-[var(--soft)]">Ce fichier n'est plus disponible.</p><Button asChild className="mt-8"><Link to="/bibliotheque">Retour à la bibliothèque</Link></Button></div>;
  const download=()=>{void supabase.rpc('increment_post_counter',{post_id:post.id,counter:'downloads'})};
  return <div className="container py-12"><Link className="inline-flex items-center gap-2 text-sm text-[var(--soft)] hover:text-indigo-600" to="/bibliotheque"><ChevronLeft size={18}/> Retour à la bibliothèque</Link><div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_310px]"><div><div className="flex flex-wrap gap-2"><span className="rounded-lg bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{post.category}</span>{post.tags.map(t=><span key={t} className="rounded-lg bg-[var(--muted)] px-3 py-1 text-xs">#{t}</span>)}</div><h1 className="mt-5 break-words text-3xl font-extrabold sm:text-5xl">{post.title}</h1><p className="mt-5 whitespace-pre-wrap text-[var(--soft)]">{post.description}</p><FilePreview post={post}/></div><aside className="h-fit rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 lg:sticky lg:top-25"><h2 className="mb-5 text-lg font-bold">À propos de la ressource</h2><dl className="space-y-4 text-sm">{[['Format',post.type.toUpperCase()],['Taille',size(post.file_size)],['Publié le',date(post.created_at)],['Consultations',String(post.views)],['Téléchargements',String(post.downloads)]].map(([k,v])=><div key={k} className="flex justify-between gap-3"><dt className="text-[var(--soft)]">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}</dl><div className="mt-7 space-y-3">{post.file_url&&<Button asChild className="w-full"><a href={downloadUrl(post.file_url)} download target="_blank" rel="noreferrer" onClick={download}><ArrowDownToLine size={18}/> Télécharger</a></Button>}<Button variant="outline" className="w-full" onClick={async()=>{await navigator.clipboard.writeText(location.href);setCopied(true);setTimeout(()=>setCopied(false),2000)}}>{copied?<Check size={18}/>:<Share2 size={18}/>} {copied?'Lien copié':'Partager'}</Button></div></aside></div><section className="mt-22"><h2 className="mb-7 text-2xl font-extrabold">À découvrir aussi</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.filter(p=>p.id!==post.id&&p.category===post.category).slice(0,3).map(p=><PostCard key={p.id} post={p}/>)}</div></section></div>;
}
