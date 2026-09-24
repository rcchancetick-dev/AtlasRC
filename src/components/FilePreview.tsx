import type { Post } from '../lib/supabase';
import { TextFileViewer } from './TextFileViewer';

export function FilePreview({ post }: { post: Post }) {
  const url = post.file_url;
  if (!url) return <p className="rounded-xl bg-[var(--muted)] p-5 text-sm">Aucun aperçu disponible.</p>;
  const type = post.type?.toLowerCase();
  if (type === 'image') return <div className="file-preview flex min-w-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--muted)]"><img src={url} alt={post.title} loading="lazy" className="block max-h-[70dvh] max-w-full object-contain"/></div>;
  if (type === 'video') return <div className="file-preview min-w-0 overflow-hidden rounded-2xl bg-black"><video controls preload="metadata" playsInline className="block aspect-video h-auto w-full max-w-full" src={url}>Votre navigateur ne prend pas en charge cette vidéo.</video></div>;
  if (type === 'audio') return <div className="file-preview min-w-0 rounded-2xl bg-[var(--muted)] p-3 sm:p-6"><audio controls preload="none" className="block w-full max-w-full" src={url}>Votre navigateur ne prend pas en charge ce fichier audio.</audio></div>;
  if (type === 'pdf' || post.mime_type === 'application/pdf') return <div className="file-preview min-w-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"><iframe title={`Aperçu de ${post.title}`} src={url} loading="lazy" className="block h-[60dvh] min-h-[320px] w-full max-w-full sm:h-[72dvh]"/><p className="border-t border-[var(--line)] px-4 py-3 text-xs text-[var(--soft)]">L’aperçu PDF dépend du navigateur. Le bouton « Ouvrir le fichier » reste disponible.</p></div>;
  if (type === 'text' || post.mime_type?.startsWith('text/')) return <div className="file-preview min-w-0"><TextFileViewer url={url}/></div>;
  return <div className="file-preview min-w-0 break-words rounded-2xl bg-[var(--muted)] p-5 text-sm [overflow-wrap:anywhere]">Aperçu indisponible pour ce format. Utilisez « Ouvrir le fichier » ou « Télécharger ».</div>;
}
