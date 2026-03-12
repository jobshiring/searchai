"use client";

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import EmptyChatMessageInput from './EmptyChatMessageInput';
import { File } from './ChatWindow';
import Link from 'next/link';
import WeatherWidget from './WeatherWidget';
import NewsArticleWidget from './NewsArticleWidget';
import SettingsButtonMobile from '@/components/Settings/SettingsButtonMobile';
import {
  getShowNewsWidget,
  getShowWeatherWidget,
} from '@/lib/config/clientRegistry';

import { useChat } from '@/lib/hooks/useChat';
import { Switch } from '@headlessui/react';
import { cn } from '@/lib/utils';

const EmptyChat = () => {
  const { aiInsightsEnabled, setAiInsightsEnabled } = useChat();
  const [showWeather, setShowWeather] = useState(() =>
    typeof window !== 'undefined' ? getShowWeatherWidget() : true,
  );
  const [showNews, setShowNews] = useState(() =>
    typeof window !== 'undefined' ? getShowNewsWidget() : true,
  );

  useEffect(() => {
    const updateWidgetVisibility = () => {
      setShowWeather(getShowWeatherWidget());
      setShowNews(getShowNewsWidget());
    };

    updateWidgetVisibility();

    window.addEventListener('client-config-changed', updateWidgetVisibility);
    window.addEventListener('storage', updateWidgetVisibility);

    return () => {
      window.removeEventListener(
        'client-config-changed',
        updateWidgetVisibility,
      );
      window.removeEventListener('storage', updateWidgetVisibility);
    };
  }, []);

  return (
    <div className="relative">
      <div className="absolute w-full flex flex-row items-center justify-end mr-5 mt-5">
        <SettingsButtonMobile />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen max-w-screen-md mx-auto p-4 space-y-12">
        <div className="flex flex-col items-center justify-center w-full space-y-10">
          <h1 className="text-black dark:text-white text-7xl font-bold tracking-tight mb-4">
            Searchingness
          </h1>
          <div className="w-full max-w-2xl">
            <EmptyChatMessageInput />
            <div className="flex flex-row items-center justify-center mt-6 space-x-3">
              <span className={cn(
                "text-sm font-medium transition-colors duration-200",
                aiInsightsEnabled ? "text-black/40 dark:text-white/40" : "text-black dark:text-white"
              )}>
                Links
              </span>
              <Switch
                checked={aiInsightsEnabled}
                onChange={setAiInsightsEnabled}
                className={cn(
                  aiInsightsEnabled ? 'bg-sky-500' : 'bg-gray-200 dark:bg-dark-300',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    aiInsightsEnabled ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
              <span className={cn(
                "text-sm font-medium transition-colors duration-200",
                aiInsightsEnabled ? "text-black dark:text-white" : "text-black/40 dark:text-white/40"
              )}>
                AI Insights
              </span>
            </div>
          </div>
        </div>
        {(showWeather || showNews) && (
          <div className="flex flex-col w-full gap-6 mt-8 sm:flex-row sm:justify-center max-w-2xl">
            {showWeather && (
              <div className="flex-1 w-full">
                <WeatherWidget />
              </div>
            )}
            {showNews && (
              <div className="flex-1 w-full">
                <NewsArticleWidget />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyChat;
