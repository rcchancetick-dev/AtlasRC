import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Props = { fileUrl: string; title: string };
const URL_PATTERN = /https?:\/\/[^\s<>"'`]+/gi;
const MAX_TEXT_SIZE = 2 * 1024 * 1024;

function linkedText(text: string) {
  const pieces: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const raw = match[0];
    const start = match.index;
    pieces.push(text.slice(last, start));
    const link = raw.replace(/[.,;:!?\)\]\}]+$/, '');
    try {
      const url = new URL(link);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        pieces.push(<a key={start} href={url.href} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-indigo-600 underline decoration-indigo-400 underline-offset-2 hover:text-violet-600 dark:text-indigo-300">{link}</a>);
      } else pieces.push(link);
    } catch { pieces.push(link); }
    pieces.push(raw.slice(link.length));
    last = start + raw.length;
  }
  pieces.push(text.slice(last));
  return pieces;
}

function storagePath(fileUrl: string) {
  try {
    const url = new URL(fileUrl);
    const marker = '/storage/v1/object/public/content/';
    const index = url.pathname.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch { return null; }
}

export function TextFileViewer({fileUrl,title}:Props) {
  const [text,setText] = useState('');
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  useEffect(() => {
    let active = true;
    const path = storagePath(fileUrl);
    setText(''); setError(''); setLoading(true);
    if (!path) { setError('Impossible de localiser ce fichier texte.'); setLoading(false); return; }
    void (async () => {
      const {data,error:downloadError} = await supabase.storage.from('content').download(path);
      if (!active) return;
      if (downloadError || !data) {setError('Impossible de lire ce fichier. Vous pouvez toujours le télécharger.');setLoading(false);return;}
      if (data.size > MAX_TEXT_SIZE) {setError('Ce fichier est trop volumineux pour l’aperçu. Téléchargez-le pour le lire.');setLoading(false);return;}
      try {setText(await data.text());} catch {setError('Impossible de décoder ce fichier texte.');}
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  },[fileUrl]);
  return <div className="w-full p-6 sm:p-8" aria-label={`Contenu du fichier ${title}`}>
    {loading ? <p role="status" className="text-[var(--soft)]">Chargement du fichier texte…</p> : error ? <p role="alert" className="text-[var(--soft)]">{error}</p> : <div className="whitespace-pre-wrap break-words font-mono text-sm leading-7">{linkedText(text)}</div>}
  </div>;
}
