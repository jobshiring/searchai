'use client';

import React from 'react';
import { Chunk } from '@/lib/types';
import { useChat } from '@/lib/hooks/useChat';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchResultsListProps {
  sources: Chunk[];
  query: string;
}

const SearchResultsList = ({ sources, query }: SearchResultsListProps) => {
  const { sendMessage, loading, messages } = useChat();

  // Find the current message to determine current page
  const currentMessage = [...messages].reverse().find(m => m.query === query && m.searchMode === 'search');
  const currentPage = currentMessage?.page || 1;
  
  // We don't have a total results count from the researcher easily, 
  // so we'll just show "Next" if we have results.
  const hasResults = sources.length > 0;
  
  return (
    <div className="flex flex-col space-y-8 w-full">
      <div className="flex flex-col space-y-6">
        {sources.map((source, index) => (
          <div key={index} className="flex flex-col space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 truncate">
              {source.metadata.favicon && (
                <img src={source.metadata.favicon} alt="" className="w-4 h-4" />
              )}
              <span className="truncate">{source.metadata.url}</span>
            </div>
            <a
              href={source.metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {source.metadata.title}
            </a>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {source.content}
            </p>
          </div>
        ))}
      </div>

      {hasResults && (
        <div className="flex items-center space-x-4 pt-4">
          <button
            onClick={() => sendMessage(query, undefined, false, currentPage + 1)}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 hover:bg-light-300 dark:hover:bg-dark-300 transition-colors disabled:opacity-50"
          >
            <span>Next 10 results</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsList;
