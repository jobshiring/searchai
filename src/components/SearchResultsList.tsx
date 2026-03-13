'use client';

import { Chunk } from '@/lib/types';
import Image from 'next/image';
import { useChat } from '@/lib/hooks/useChat';
import Pagination from './ui/Pagination';

interface SearchResultsListProps {
  sources: Chunk[];
  query: string;
}

const SearchResultsList = ({ sources, query }: SearchResultsListProps) => {
  const { sendMessage, loading, messages } = useChat();

  // Find the current message to determine current page
  const currentMessage = [...messages].reverse().find(m => m.query === query && m.searchMode === 'search');
  const currentPage = currentMessage?.page || 1;
  const totalResults = currentMessage?.totalResults || 0;
  const hasMore = currentMessage?.hasMore || false;
  
  const hasResults = sources.length > 0;

  const startResult = (currentPage - 1) * 10 + 1;
  const endResult = Math.min(currentPage * 10, totalResults || sources.length);

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    sendMessage(query, undefined, false, page);
  };
  
  return (
    <div className="flex flex-col space-y-8 w-full">
      {hasResults && totalResults > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {startResult}-{endResult} of about {totalResults} results
        </div>
      )}
      <div className="flex flex-col space-y-6">
        {sources.map((source, index) => (
          <div key={index} className="flex flex-col space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 truncate">
              {source.metadata.favicon && (
                <Image
                  src={source.metadata.favicon}
                  alt=""
                  width={16}
                  height={16}
                  className="w-4 h-4"
                  unoptimized
                />
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

      {(hasResults || currentPage > 1) && (
        <Pagination 
          currentPage={currentPage}
          onPageChange={handlePageChange}
          loading={loading}
          hasMore={hasMore}
        />
      )}
    </div>
  );
};

export default SearchResultsList;
