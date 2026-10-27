import Link from 'next/link';
import { Send } from 'lucide-react';
import { isArticleUrl, type ArticleDocument } from 'shared';
import { BlogBody } from './BlogBody';
import { ArticleBlockIcon } from './ArticleBlockIcon';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

export function ArticleBlocks({ document }: { document: ArticleDocument }) {
  return <div className="space-y-7">{document.blocks.map(block => {
    switch (block.type) {
      case 'paragraph': return block.text.trim() ? <BlogBody key={block.id} content={block.text} /> : null;
      case 'heading': return block.text.trim() ? block.level === 3 ? <h3 key={block.id} className="pt-1 text-xl font-bold text-slate-900">{block.text}</h3> : <h2 key={block.id} className="pt-2 text-2xl font-bold text-slate-900">{block.text}</h2> : null;
      case 'image': return block.url && isArticleUrl(block.url) ? <figure key={block.id}><ImageWithFallback src={block.url} alt={block.alt} className="max-h-[680px] w-full rounded-xl object-cover" />{block.caption.trim() && <figcaption className="mt-2 text-center text-sm text-slate-500">{block.caption}</figcaption>}</figure> : null;
      case 'experiences': {
        const items = block.items.filter(item => item.title.trim() || item.description.trim());
        return items.length ? <section key={block.id} className="space-y-5">{block.title.trim() && <h2 className="text-2xl font-bold text-slate-900">{block.title}</h2>}{items.map((item, index) => <div key={index} className="flex items-start gap-4"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${index % 3 === 0 ? 'bg-sky-50 text-sky-700' : index % 3 === 1 ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-500'}`}><ArticleBlockIcon name={item.icon} /></span><div className="min-w-0 space-y-1"><h3 className="font-bold text-slate-900">{item.title}</h3><p className="whitespace-pre-line text-sm leading-7 text-slate-600">{item.description}</p></div></div>)}</section> : null;
      }
      case 'callout': return block.text.trim() ? <aside key={block.id} className={`flex items-start gap-3 rounded-xl border p-5 ${block.tone === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' : block.tone === 'note' ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-blue-100 bg-blue-50 text-blue-700'}`}><span className="mt-1 shrink-0"><ArticleBlockIcon name={block.icon} /></span><p className="whitespace-pre-line text-sm italic leading-7">{block.text}</p></aside> : null;
      case 'list': {
        const items = block.items.filter(item => item.trim()).map((item, index) => <li key={index}>{item}</li>);
        return !items.length ? null : block.ordered ? <ol key={block.id} className="list-decimal space-y-2 pl-6 text-slate-700">{items}</ol> : <ul key={block.id} className="list-disc space-y-2 pl-6 text-slate-700">{items}</ul>;
      }
      case 'cta': return block.label.trim() && isArticleUrl(block.url) ? <div key={block.id}><Link href={block.url} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"><Send size={16} />{block.label}<span aria-hidden="true">→</span></Link></div> : null;
    }
  })}</div>;
}
