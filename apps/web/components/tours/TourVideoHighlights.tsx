"use client";

import { Play, Video, X } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { Dialog } from "@/components/common/Dialog";
import type { TourVideoHighlightsProps, VideoItem } from 'shared';

export default function TourVideoHighlights({ videos = [] }: TourVideoHighlightsProps) {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const titleId = useId();

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <Video className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Trải nghiệm qua video</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {videos.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setActiveVideo(item)}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900 cursor-pointer shadow-sm transition hover:shadow-md"
          >
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, 300px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-sky-600 shadow-lg backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:bg-white">
                <Play className="h-5 w-5 fill-sky-600 translate-x-0.5" />
              </div>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
              <span className="truncate text-sm font-bold drop-shadow">{item.title}</span>
              <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
                <Video className="h-3 w-3" /> Xem Video
              </span>
            </div>
          </button>
        ))}
      </div>

      {activeVideo && (
        <Dialog onClose={() => setActiveVideo(null)} labelledBy={titleId} overlayClassName="bg-black/85">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            <div className="flex items-center justify-between bg-slate-900 px-5 py-3 text-white">
              <h3 id={titleId} className="text-sm sm:text-base font-bold truncate">Trải nghiệm: {activeVideo.title}</h3>
              <button
                type="button"
                aria-label="Đóng video"
                onClick={() => setActiveVideo(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src={`${activeVideo.videoUrl}${activeVideo.videoUrl.includes("?") ? "&" : "?"}autoplay=1`}
                title={activeVideo.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
