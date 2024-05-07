import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Open Bran | Chat',
  description: 'Chat with the internet, chat with Open Bran.',
};

const Home = () => {
  return (
    <div>
      <ChatWindow />
    </div>
  );
};

export default Home;
