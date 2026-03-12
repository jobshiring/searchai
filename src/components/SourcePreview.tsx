'use client';

import React from 'react';
import Image from 'next/image';
import { Chunk } from '@/lib/types';
import { ExternalLink, FileText } from 'lucide-react';

interface SourcePreviewProps {
  sources: Chunk[];
}

const SourcePreview: React.FC<SourcePreviewProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  // Take top 4 sources for preview
  const previewSources = sources.slice(0, 4);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2 px-1">
        <FileText size={18} className="text-black/70 dark:text-white/70" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-black/50 dark:text-white/50">
          Source Previews
        </h3>
      </div>
      <div className="space-y-3">
        {previewSources.map((source, index) => {
          const domain = source.metadata.url.replace(/.+\/\/|www.|\..+/g, '');
          const faviconUrl = `https://s2.googleusercontent.com/s2/favicons?domain_url=${source.metadata.url}`;
          
          return (
            <a
              key={index}
              href={source.metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-2xl bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <Image
                    src={faviconUrl}
                    alt="favicon"
                    className="w-4 h-4 rounded-sm flex-shrink-0"
                    width={16}
                    height={16}
                    unoptimized
                    onError={(e: any) => {
                      (e.target as HTMLImageElement).src = ''; // Fallback or hide
                    }}
                  />
                  <span className="text-xs font-medium text-black/60 dark:text-white/60 truncate uppercase tracking-tight">
                    {domain}
                  </span>
                </div>
                <ExternalLink size={12} className="text-black/30 dark:text-white/30 group-hover:text-sky-500 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-black dark:text-white line-clamp-2 mb-2 leading-snug group-hover:text-sky-500 transition-colors">
                {source.metadata.title}
              </h4>
              <p className="text-xs text-black/70 dark:text-white/70 line-clamp-3 leading-relaxed italic">
                &ldquo;{source.content.length > 150 ? source.content.substring(0, 150) + '...' : source.content}&rdquo;
              </p>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SourcePreview;
