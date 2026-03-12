"use client";

import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Sources from './MessageInputActions/Sources';
import Optimization from './MessageInputActions/Optimization';
import Attach from './MessageInputActions/Attach';
import { useChat } from '@/lib/hooks/useChat';
import ModelSelector from './MessageInputActions/ChatModelSelector';

const EmptyChatMessageInput = () => {
  const { sendMessage } = useChat();

  /* const [copilotEnabled, setCopilotEnabled] = useState(false); */
  const [message, setMessage] = useState('');

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;

      const isInputFocused =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.hasAttribute('contenteditable');

      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    inputRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage(message);
        setMessage('');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage(message);
          setMessage('');
        }
      }}
      className="w-full"
    >
      <div className="flex flex-col bg-light-secondary dark:bg-dark-secondary px-5 pt-6 pb-4 rounded-3xl w-full border border-light-200 dark:border-dark-200 shadow-md shadow-light-200/20 dark:shadow-black/40 transition-all duration-300 focus-within:border-sky-500/50 dark:focus-within:border-sky-500/50 focus-within:ring-4 focus-within:ring-sky-500/5 dark:focus-within:ring-sky-500/10">
        <TextareaAutosize
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={1}
          className="px-2 bg-transparent placeholder:text-lg placeholder:text-black/40 dark:placeholder:text-white/40 text-lg text-black dark:text-white resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
          placeholder="Search the web or ask a question..."
        />
        <div className="flex flex-row items-center justify-between mt-6">
          <div className="flex flex-row items-center space-x-1 opacity-80 hover:opacity-100 transition-opacity">
            <Optimization />
            <Sources />
            <ModelSelector />
            <Attach />
          </div>
          <button
            disabled={message.trim().length === 0}
            className="bg-sky-500 text-white disabled:opacity-50 hover:bg-sky-600 transition-all duration-200 rounded-full p-2.5 shadow-lg shadow-sky-500/20"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default EmptyChatMessageInput;
