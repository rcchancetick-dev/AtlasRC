import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Download, Eye, FileText, Image, Music, Video } from 'lucide-react';
import type { Post } from '../lib/supabase';

const icons = { pdf: FileText, image: Image, video: Video, audio: Music, text: FileText, other: FileText };
const size = (n: number | null) => n ? n < 1048576 ? `${Math.round(n / 1024)} Ko` : `${(n / 1048576).toFixed(1)} Mo` : '';
export function PostCard({ post }: { post: Post }) {
  const Icon = icons[post.type] || FileText;
  const reduced = useReducedMotion();
  return <motion.div className="min-w-0" initial={false} whileHover={reduced ? undefined : { y: -4 }} whileTap={reduced ? undefined : { scale: .99 }} transition={{ duration: .18 }}>
    <Link to={`/contenu/${post.id}`} className="post-card group block min-w-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] transition-shadow duration-200 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-slate-900">
        {post.thumbnail_url ? <img src={post.thumbnail_url} loading="lazy" alt="" className="h-full w-full object-cover"/> : <Icon size={64} className="text-indigo-400"/>}
        <span className="absolute left-4 top-4 rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase shadow-sm">{post.type}</span>
      </div>
      <div className="min-w-0 p-5"><div className="mb-2 text-xs font-semibold text-indigo-600">{post.category}</div><h3 className="post-card-title break-words text-lg font-bold leading-snug [overflow-wrap:anywhere]">{post.title}</h3><p className="mt-2 line-clamp-2 break-words text-sm text-[var(--soft)]">{post.description}</p><div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--soft)]"><span className="flex items-center gap-1"><Eye size={14}/>{post.views}</span><span className="flex items-center gap-1"><Download size={14}/>{post.downloads}</span><span>{size(post.file_size)}</span><ArrowUpRight size={17}/></div></div>
    </Link>
  </motion.div>;
}
