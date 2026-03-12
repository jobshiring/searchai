import { getTavilyApiKey } from './config/serverRegistry';

interface TavilySearchOptions {
  search_depth?: 'basic' | 'advanced';
  include_images?: boolean;
  include_answer?: boolean;
  include_domains?: string[];
}

export const searchTavily = async (
  query: string,
  opts?: TavilySearchOptions,
) => {
  const tavilyApiKey = getTavilyApiKey();

  if (!tavilyApiKey) {
    throw new Error('Tavily API key not found');
  }

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: tavilyApiKey,
      query,
      search_depth: opts?.search_depth || 'basic',
      include_images: opts?.include_images || false,
      include_answer: opts?.include_answer || false,
      include_domains: opts?.include_domains || [],
    }),
    signal: AbortSignal.timeout(15000), // 15s timeout
  });

  if (!res.ok) {
    throw new Error(`Tavily error: ${res.statusText}`);
  }

  const data = await res.json();

  const results = data.results.map((r: any) => ({
    title: r.title,
    url: r.url,
    content: r.content,
  }));

  return { results, images: data.images || [] };
};
