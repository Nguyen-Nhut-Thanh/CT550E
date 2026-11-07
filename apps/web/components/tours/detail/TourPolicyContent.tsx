import { BlogBody } from '@/components/blog/article/BlogBody';

export function TourPolicyContent({ content, included = false }: { content: string; included?: boolean }) {
  return <div className={`[&>div]:space-y-3 [&>div]:text-[13px] [&>div]:leading-6 [&>div]:text-[#52627e] [&_li]:leading-6 [&_ol]:space-y-2 [&_ul]:space-y-2 [&_h2]:text-[16px] [&_h3]:text-[14px] ${included ? "[&_ul]:list-none [&_ul]:pl-0 [&_ul>li]:relative [&_ul>li]:pl-7 [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-0.5 [&_ul>li]:before:flex [&_ul>li]:before:size-[18px] [&_ul>li]:before:items-center [&_ul>li]:before:justify-center [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-emerald-500 [&_ul>li]:before:text-[11px] [&_ul>li]:before:font-bold [&_ul>li]:before:text-white [&_ul>li]:before:content-['✓']" : ''}`}><BlogBody content={content} /></div>;
}
