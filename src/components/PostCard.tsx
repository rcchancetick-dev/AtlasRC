import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, FileText, Image, Video, Headphones, BookOpen, File } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { Post } from '../lib/supabase';
import { supabase, date, size } from '../lib/supabase';

const icons={pdf:FileText,image:Image,video:Video,audio:Headphones,text:BookOpen,other:File};
const downloadUrl=(url:string)=>{const parsed=new URL(url);parsed.searchParams.set('download','');return parsed.toString()};

export function PostCard({post}:{post:Post}){
  const Icon=icons[post.type]||File;
  const countDownload=(event:MouseEvent<HTMLAnchorElement>)=>{event.stopPropagation();void supabase.rpc('increment_post_counter',{post_id:post.id,counter:'downloads'})};
  return <motion.article layout initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} whileHover={{y:-5}} transition={{duration:.3}} className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm transition-shadow hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10">
    <Link to={`/contenu/${post.id}`} className="block focus-visible:outline-2 focus-visible:outline-indigo-500" aria-label={`Consulter ${post.title}`}><div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100 dark:from-slate-800 dark:to-indigo-950">{post.thumbnail_url||post.type==='image'&&post.file_url?<img loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={post.thumbnail_url||post.file_url||''} alt=""/>:<Icon className="h-14 w-14 text-indigo-400" aria-hidden="true"/>}<span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 backdrop-blur">{post.category}</span></div><div className="p-5 pb-3"><div className="mb-3 flex items-center justify-between text-xs text-[var(--soft)]"><span className="flex items-center gap-1"><Icon size={14}/>{post.type.toUpperCase()}</span><span>{size(post.file_size)}</span></div><h3 className="line-clamp-2 min-h-12 text-lg font-bold leading-snug">{post.title}</h3><p className="mt-2 line-clamp-2 min-h-10 text-sm text-[var(--soft)]">{post.description||'Découvrez cette ressource dans la bibliothèque AtlasRC.'}</p><div className="mt-5 border-t border-[var(--line)] pt-4 text-xs text-[var(--soft)]">{date(post.created_at)}</div></div></Link>
    {post.file_url&&<div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-5"><Link to={`/contenu/${post.id}`} className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">Consulter →</Link><a href={downloadUrl(post.file_url)} download target="_blank" rel="noreferrer" onClick={countDownload} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold hover:border-indigo-400 focus-visible:outline-2 focus-visible:outline-indigo-500" aria-label={`Télécharger ${post.title}`}><ArrowDownToLine size={16}/> Télécharger</a></div>}
  </motion.article>
}
