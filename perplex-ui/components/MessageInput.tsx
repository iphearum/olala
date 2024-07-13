import { cn } from '@/lib/utils';
import { ArrowRight, ArrowUp } from 'lucide-react';
import { memo, useContext, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Attach, CopilotToggle, Focus } from './MessageInputActions';
import homeContext from '@/app/api/home/home.context';
import { useMessage } from '@/hooks/useMessage';
import { useStorage } from '@/hooks/useHook';

interface Props {
  sendMessage: (message: string) => void;
  loading: boolean;
}
interface TypeFocusMode {
  focusMode: string;
  setFocusMode: (mode: string) => void;
}

const MessageInput = memo(({
  focusMode,
  setFocusMode
}: TypeFocusMode) => {
  const {
    state: { loading },
    dispatch,
  } = useContext(homeContext);

  const [message, setMessage] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const [mode, setMode] = useState<'multi' | 'single'>('single');

  useEffect(() => {
    if (textareaRows >= 2 && message && mode === 'single') {
      setMode('multi');
    } else if (!message && mode === 'multi') {
      setMode('single');
    }
  }, [textareaRows, mode, message]);

  return (
    <form
      onSubmit={(e) => {
        if (loading) return;
        e.preventDefault();
        dispatch({
          field: 'message',
          value: message,
        });
        setMessage('');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && !loading) {
          e.preventDefault();
          dispatch({
            field: 'message',
            value: message,
          });
          setMessage('');
        }
      }}
      className={cn(
        'p-4 flex items-center overflow-hidden',
        mode === 'multi' ? 'flex-col rounded-lg' : 'flex-row rounded-full',
        'bg-[var(--sidebar-surface-primary)]',
      )}
    >
      
      {mode === 'single' && <div className='flex items-center'>
      <Focus />
      <Attach />
      </div>}
      <TextareaAutosize
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onHeightChange={(height, props) => {
          setTextareaRows(Math.ceil(height / props.rowHeight));
        }}
        className="transition bg-transparent placeholder:text-sm text-sm resize-none focus:outline-none w-full px-2 max-h-24 lg:max-h-36 xl:max-h-48 flex-grow flex-shrink"
        placeholder="Ask a follow-up"
      />
      <div className="flex flex-row items-center space-x-4">
        <CopilotToggle />
        {mode === 'multi' && <Attach />}
        <div className={cn(
          "text-[var(--text-primary)] bg-[var(--main-surface-primary)] transition duration-100 rounded-full",
          message.trim().length!=0?"shadow-sm text-xl p-0.5":null
        )}>
          <button
            disabled={message.trim().length === 0 || loading}
            className="text-[var(--text-primary)] hover:bg-opacity-85 transition duration-100 p-2"
          >
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </form>
  );
});

export default MessageInput;
