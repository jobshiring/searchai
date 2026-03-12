import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Search Engine - Searchingness',
  description: 'Search the internet with AI, get answers.',
};

const Home = () => {
  return <ChatWindow />;
};

export default Home;
