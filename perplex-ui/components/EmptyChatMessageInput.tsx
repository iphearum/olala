import { ArrowRight } from 'lucide-react';
import { memo, useContext, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Attach, CopilotToggle, Focus } from './MessageInputActions';
import { useStorage } from '@/hooks/useHook';
import homeContext from '@/app/api/home/home.context';
import { translate } from '@/lib/translate';

interface Props {
  focusMode: string;
  setFocusMode: (mode: string) => void;
}

const EmptyChatMessageInput = memo(({
  focusMode,
  setFocusMode,
}: Props) => {
  const {
    state:{},
    dispatch
  } = useContext(homeContext);

  const questions = [
    'Compute the derivative of the function [f(x) = 3x^3 - 2x^2 + x - 5]',
    'Hello, how are you?',
  ];
  const [message, setMessage] = useState(questions[0]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch({
          field: 'message',
          value: message
        })
        setMessage('');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          dispatch({
            field: 'message',
            value: message
          })
          setMessage('');
        }
      }}
      className="w-full"
    >
      <div className="relative bg-[var(--sidebar-surface-primary)] text-[var(--text-primary)] flex flex-col px-5 pt-5 pb-2 rounded-lg w-full">
        <TextareaAutosize
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={2}
          className="bg-transparent text-xlresize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
          placeholder="Ask anything..."
        />
        <div className="relative w-full flex flex-row items-center justify-between mt-4">
          <div className="flex flex-row items-center space-x-1 -mx-2">
            <Focus />
            <Attach />
          </div>
          <div className="flex flex-row items-center space-x-4 -mx-2">
            <CopilotToggle />
            <button
              disabled={message.trim().length === 0}
              className="bg-[#24A0ED] text-white disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#ececec21] rounded-full p-2"
            >
              <ArrowRight className="bg-background" size={17} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
});

export default EmptyChatMessageInput;
