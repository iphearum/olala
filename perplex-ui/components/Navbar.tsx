import { Clock, Edit, Share, Trash } from 'lucide-react';
import { Message } from './ChatWindow';
import { memo, useEffect, useState } from 'react';
import { formatTimeDifference } from '@/lib/utils';

interface Props { messages: Message[] }

const Navbar = memo(({ messages }: Props) => {
  const [title, setTitle] = useState<string>('');
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (messages.length > 0) {
      const newTitle =
        messages[0].content.length > 25
          ? `${messages[0].content.substring(0, 25).trim()}...`
          : messages[0].content;
      setTitle(newTitle);
      const newTimeAgo = formatTimeDifference(
        new Date(),
        messages[0].createdAt,
      );
      setTimeAgo(newTimeAgo);
    }
  }, [messages]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (messages.length > 0) {
        const newTimeAgo = formatTimeDifference(
          new Date(),
          messages[0].createdAt,
        );
        setTimeAgo(newTimeAgo);
      }
    }, 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='sticky z-40 top-0 text-black dark:text-white border-b border-gray-200 dark:border-gray-800'>
      <div className='absolute inset-0 -bottom-14 backdrop-blur-xl pointer-events-none [-webkit-mask-image:linear-gradient(black_25%,_transparent)]'></div>
      <div className="absolute flex flex-row items-center justify-between w-full py-4 text-sm z-50">
        <Edit
          size={17}
          className="active:scale-95 transition duration-100 cursor-pointer lg:hidden"
        />
        <div className="hidden w-[120px] lg:flex flex-row items-center justify-center space-x-2">
          <Clock size={17} />
          <p className="text-xs">{timeAgo} ago</p>
        </div>
        <p className="hidden lg:flex">{title}</p>
        <div className="md:hidden flex flex-row items-center space-x-4">
          <Share
            size={17}
            className="active:scale-95 transition duration-100 cursor-pointer"
          />
          <Trash
            size={17}
            className="text-red-400 active:scale-95 transition duration-100 cursor-pointer"
          />
        </div>
        <div></div>
      </div>
    </div>
  );
});

export default Navbar;
