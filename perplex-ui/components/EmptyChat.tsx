import { cn } from '@/lib/utils';
import EmptyChatMessageInput from './EmptyChatMessageInput';
import StarNight from '@/components/icons/StarNight';
import { GRADIANTCOLOR } from '@/lib/constants';
import { memo, useContext } from 'react';
import { useMessage } from '@/hooks/useMessage';
import homeContext from '@/app/api/home/home.context';

interface Props {
  focusMode: string;
  setFocusMode: (mode: string) => void;
}

const EmptyChat = memo(({focusMode,setFocusMode}: Props) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-screen-sm mx-auto p-2 space-y-8">
      <span
        className={cn(
          'bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text',
          'text-4xl relative font-medium -mt-8',
        )}
      >
        <StarNight className="text-blue-500 absolute -top-5 -left-7 w-8" />{' '}
        [Research <span className="animate-spin -right-6">/</span> Chat] begins
        here!
      </span>
      {/* <EmptyChatMessageInput
        focusMode={focusMode}
        setFocusMode={setFocusMode}
      /> */}
    </div>
  );
});

export default EmptyChat;
