'use client';

import { useChat } from '@/lib/hooks/useChat';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Sparkles, Search } from 'lucide-react';

const ModeToggle = () => {
  const { searchMode, setSearchMode } = useChat();

  return (
    <div className="flex items-center p-1 rounded-full bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 w-fit">
      <button
        onClick={() => setSearchMode('ai')}
        className={cn(
          "relative flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200",
          searchMode === 'ai' 
            ? "text-black dark:text-white" 
            : "text-black/50 dark:text-white/50 hover:text-black/70 dark:hover:text-white/70"
        )}
      >
        {searchMode === 'ai' && (
          <motion.div
            layoutId="activeMode"
            className="absolute inset-0 bg-white dark:bg-dark-primary rounded-full shadow-sm border border-light-200 dark:border-dark-200"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Sparkles size={14} className="relative z-10" />
        <span className="relative z-10">AI Answer</span>
      </button>
      <button
        onClick={() => setSearchMode('search')}
        className={cn(
          "relative flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200",
          searchMode === 'search' 
            ? "text-black dark:text-white" 
            : "text-black/50 dark:text-white/50 hover:text-black/70 dark:hover:text-white/70"
        )}
      >
        {searchMode === 'search' && (
          <motion.div
            layoutId="activeMode"
            className="absolute inset-0 bg-white dark:bg-dark-primary rounded-full shadow-sm border border-light-200 dark:border-dark-200"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Search size={14} className="relative z-10" />
        <span className="relative z-10">Web Results</span>
      </button>
    </div>
  );
};

export default ModeToggle;
