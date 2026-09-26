import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Calendar, Download, Eye, FileDown, Loader2, Tag } from 'lucide-react';
import { supabase, type Post } from '../lib/supabase';
import { FilePreview } from '../components/FilePreview';
import { PostCard } from '../components/PostCard';
import { Button } from '../components/ui/button';

const formatSize = (bytes: number | null) => bytes ? bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} Ko` : `${(bytes / 1024 / 1024).toFixed(1)} Mo` : '—';

export function ContentDetail({ posts, loading }: { posts: Post[]; loading: boolean }) {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [views, setViews] = useState<number | null>(null);
  const [downloads, setDownloads] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const counted = useRef<string | null>(null);
  useEffect(() => {
    let active = true;
    const local = posts.find(p => p.id === id);
    setViews(null);
    setDownloads(null);
    if (local) { setPost(local); setBusy(false); } else { setBusy(true); setPost(null); }
    if (!id) { setBusy(false); return () => { active = false; }; }
    void supabase.from('posts').select('*').eq('id', id).single().then(({ data, error: fetchError }) => {
      if (!active) return;
      setPost((data as Post | null) ?? local ?? null);
      setError(fetchError && !local ? fetchError.message : '');
      setBusy(false);
    });
    return () => { active = false; };
  }, [id]);
  useEffect(() => {
    if (!post?.id || post.id !== id || counted.current === id) return;
    counted.current = id;
    let active = true;
    void (async () => {
      const { error: rpcError } = await supabase.rpc('increment_views', { post_id: id });
      if (rpcError) { console.error('Impossible de compter cette consultation', rpcError); return; }
      const { data, error: readError } = await supabase.from('posts').select('views').eq('id', id).single();
      if (readError) console.error('Impossible de lire les consultations', readError);
      else if (active && typeof data?.views === 'number') setViews(data.views);
    })();
    return () => { active = false; };
  }, [post?.id, id]);
  const related = post ? posts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3) : [];
  if (busy || (loading && !post)) return <section className="container min-h-[65vh] py-10 sm:py-16"><div className="mb-8 h-5 w-32 animate-pulse rounded bg-[var(--muted)]"/><div className="h-96 animate-pulse rounded-2xl bg-[var(--muted)]"/></section>;
  if (!post) return <section className="container min-h-[65vh] py-12"><Link to="/bibliotheque" className="text-indigo-600">← Retour à la bibliothèque</Link><h1 className="mt-10 text-3xl font-bold">Fichier introuvable</h1>{error && <p role="alert" className="mt-4 break-words text-[var(--soft)]">{error}</p>}</section>;
  const downloadFile = async () => {
    if (!post.file_url || downloading) return;
    setDownloading(true);
    setDownloadError('');
    try {
      const response = await fetch(post.file_url);
      if (!response.ok) throw new Error(`Réponse du serveur : ${response.status}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fromUrl = post.file_url.split('/').pop()?.split('?')[0];
      link.download = fromUrl && fromUrl.includes('.') ? fromUrl : post.title;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      const { error: rpcError } = await supabase.rpc('increment_downloads', { post_id: post.id });
      if (rpcError) console.error('Impossible de compter ce téléchargement', rpcError);
      else {
        const { data } = await supabase.from('posts').select('downloads').eq('id', post.id).single();
        if (typeof data?.downloads === 'number') setDownloads(data.downloads);
      }
    } catch (err) {
      console.error('Téléchargement impossible', err);
      setDownloadError('Le téléchargement a échoué. Essayez « Ouvrir le fichier » ou réessayez plus tard.');
    } finally {
      setDownloading(false);
    }
  };
  return <article className="container min-w-0 py-7 sm:py-12 lg:py-16">
    <Link to="/bibliotheque" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-indigo-600 sm:mb-9"><ArrowLeft size={17}/> Retour à la bibliothèque</Link>
    <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start lg:gap-10">
      <div className="min-w-0">
        <div className="mb-5 flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-indigo-600"><span className="rounded-full bg-indigo-50 px-3 py-1.5 dark:bg-indigo-950">{post.category}</span><span className="rounded-full bg-[var(--muted)] px-3 py-1.5 uppercase">{post.type}</span></div>
        <h1 className="break-words text-3xl font-extrabold leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl">{post.title}</h1>
        {post.description && <p className="mt-5 whitespace-pre-line break-words leading-relaxed text-[var(--soft)] [overflow-wrap:anywhere]">{post.description}</p>}
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[var(--soft)]"><span className="inline-flex items-center gap-2"><Calendar size={16}/>{new Date(post.created_at).toLocaleDateString('fr-FR')}</span><span className="inline-flex items-center gap-2"><Eye size={16}/>{views ?? post.views} vues</span><span className="inline-flex items-center gap-2"><Download size={16}/>{downloads ?? post.downloads} téléchargements</span></div>
        {post.tags?.length > 0 && <div className="mt-5 flex flex-wrap items-center gap-2"><Tag size={16} className="shrink-0 text-[var(--soft)]"/>{post.tags.map(tag => <span key={tag} className="max-w-full break-words rounded-full bg-[var(--muted)] px-3 py-1 text-xs [overflow-wrap:anywhere]">{tag}</span>)}</div>}
        <div className="mt-8 min-w-0"><h2 className="mb-4 text-xl font-bold">Aperçu du fichier</h2><FilePreview post={post}/></div>
      </div>
      <aside className="min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm sm:p-6 lg:sticky lg:top-24"><h2 className="text-lg font-bold">Votre fichier</h2><p className="mt-2 break-words text-sm text-[var(--soft)] [overflow-wrap:anywhere]">{post.title}</p><div className="mt-5 flex justify-between gap-4 border-y border-[var(--line)] py-4 text-sm"><span className="text-[var(--soft)]">Taille</span><span className="shrink-0 font-semibold">{formatSize(post.file_size)}</span></div><div className="mt-5 grid gap-3">{post.file_url ? <><Button className="min-h-11 w-full whitespace-normal text-center" disabled={downloading} onClick={downloadFile}>{downloading ? <><Loader2 className="shrink-0 animate-spin" size={18}/> Téléchargement…</> : <><FileDown className="shrink-0" size={18}/> Télécharger</>}</Button><Button asChild variant="outline" className="min-h-11 w-full whitespace-normal text-center"><a href={post.file_url} target="_blank" rel="noopener noreferrer">Ouvrir le fichier <ArrowUpRight className="shrink-0" size={17}/></a></Button></> : <p className="text-sm text-[var(--soft)]">Lien du fichier indisponible.</p>}</div>{downloadError && <p role="alert" className="mt-3 break-words text-xs text-red-600">{downloadError}</p>}<p className="mt-4 text-xs leading-relaxed text-[var(--soft)]">Si l’aperçu n’est pas disponible sur votre appareil, ouvrez ou téléchargez le fichier.</p></aside>
    </div>
    {related.length > 0 && <section className="mt-14 min-w-0 sm:mt-20"><h2 className="mb-6 text-2xl font-extrabold">À découvrir aussi</h2><div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map(item => <PostCard key={item.id} post={item}/>)}</div></section>}
  </article>;
}
