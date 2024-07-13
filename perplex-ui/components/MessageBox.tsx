'use client';

/* eslint-disable @next/next/no-img-element */
import React, {
  MutableRefObject,
  memo,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Message } from './ChatWindow';
import { cn, preprocessLaTeX, preprocessString } from '@/lib/utils';
import { BookCopy, Disc3, Share, FastForward, Volume2, StopCircle,Languages } from 'lucide-react';
import { useSpeech } from 'react-text-to-speech';
import { MemoizedReactMarkdown } from './Markdown/MemoizedReactMarkdown';
import { CodeBlock } from './Markdown/CodeBlock';

import Night from '@/components/icons/StarNight';
import Copy from './MessageActions/Copy';
import Rewrite from './MessageActions/Rewrite';
import MessageSources from './MessageSources';
import SearchImages from './SearchImages';
import SearchVideos from './SearchVideos';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { translate } from '@/lib/translate';
import { useStorage } from '@/hooks/useHook';
import homeContext from '@/app/api/home/home.context';

interface Props {
  message: Message;
  messageIndex: number;
  history: Message[];
  loading: boolean;
  dividerRef?: MutableRefObject<HTMLDivElement | null>;
  isLast: boolean;
  rewrite: (messageId: string) => void;
}

const MessageBox = memo(({
  message,
  messageIndex,
  history,
  loading,
  dividerRef,
  isLast,
  rewrite,
}: Props) => {
  const {
    state:{
      socket
    }
  } = useContext(homeContext)
  // const { speak, voices } = useSpeechSynthesis();
  const [parsedMessage, setParsedMessage] = useState(message.content);
  // const [messtext, setMessage] = useState(null);
  const [speechMessage, setSpeechMessage] = useState(message.content);
  const [highlightText, setHighlightText] = useState(true);
  const [rate, setRate] = useState(1);
  const [voice, setVoice] = useState(null);
  const [trans, setTrans] = useStorage('trans', null)

  const rates = [0.5, 0.8, 1.2];

  const { Text, speechStatus, isInQueue, start, pause, stop } = useSpeech({
    text: speechMessage,
    preserveUtteranceQueue: true,
    rate: rates[rate],
    highlightText,
    highlightProps: { style: { color: 'white', backgroundColor: 'blue' } },
  });
  
  useEffect(() => {
    const regex = /\[(\d+)\]/g;

    if (
      message.role === 'assistant' &&
      message?.sources &&
      message.sources.length > 0
    ) {
      return setParsedMessage(
        message.content.replace(
          regex,
          (_, number) =>
            `<a href="${message.sources?.[number - 1]?.metadata?.url}" target="_blank" className="bg-[#1C1C1C] px-1 rounded ml-1 no-underline text-xs text-blue-400 relative">${number}</a>`,
        ),
      );
    }
    setSpeechMessage(message.content.replace(regex, ''));
    setParsedMessage(preprocessLaTeX(message.content));
  }, [message.content, message.sources, message.role]);

  const translater = async (str: string) => {
    const uid = socket?.id
    // if(trans != null){
    //   setParsedMessage(preprocessLaTeX(trans))
    //   return;
    // }
    socket?.send(
      JSON.stringify({
        type: 'translate',
        text: message,
        tl: 'km',
        socketId: uid,
        focusMode: 'translate'
      }),
    );
    const messageHandler = (e: any) => {
      const data = JSON.parse(e);
      // console.log(data)
      if (data.type === 'messageEnd') {
        socket?.off(`message-${uid}`, messageHandler);
      }else if(data.type === 'translate'){
        setTrans(data.data)
        setParsedMessage(preprocessLaTeX(data.data))
      }
    }
    socket?.on(`translate-${uid}`, messageHandler)
    // setTrans(text)
  }
  

  const texting = loading && isLast ? '▍' : '';

  const Markdown = memo(({ children, ...promp }: any) => {
    return (
      <MemoizedReactMarkdown
        className="overflow-x-auto prose max-w-none text-black dark:text-white break-words prose-invert prose-p:leading-relaxed prose-pre:p-0 text-sm md:text-base font-medium"
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        {...promp}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match && match[1] ? (
              <CodeBlock
                key={Math.random()}
                language={(match && match[1]) || ''}
                value={String(children).replace(/\n$/, '')}
                {...props}
              />
            ) : (
              <code className={className} {...props}>
                {String(children).replace('`', '')}
              </code>
            );
          },
          table({ children }) {
            return (
              <table className="border-collapse border border-black px-3 py-1 dark:border-white">
                {children}
              </table>
            );
          },
          th({ children }) {
            return (
              <th className="break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="break-words border border-black px-3 py-1 dark:border-white">
                {children}
              </td>
            );
          },
        }}
      >
        {children}
      </MemoizedReactMarkdown>
    );
  });

  return (
    <div className="text-gray-700 dark:text-gray-400">
      {message.role === 'user' && (
        <div className={cn('w-full text-right', messageIndex === 0 ? 'pt-3' : null)}>
          <span className="font-base text-2xl bg-[#f4f4f4] dark:bg-[#2f2f2f] dark:text-white rounded-2xl py-2 px-4">
            {message.content}
          </span>
        </div>
      )}

      {message.role === 'assistant' && (
        <div className="flex flex-col text-black dark:text-white space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9">
          <div
            ref={dividerRef}
            className="flex flex-col space-y-6 w-full lg:w-9/12 group/showoption"
          >
            {message.sources && message.sources.length > 0 && (
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row items-center space-x-2">
                  <BookCopy size={20} />
                  <h3 className="font-medium text-xl">Sources</h3>
                </div>
                <MessageSources sources={message.sources} />
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <Disc3
                  className={cn(
                    isLast && loading ? 'animate-spin' : 'animate-none',
                  )}
                  size={20}
                />
                {isLast && loading ? null : <Night className="w-5" />}
                <h3 className={cn('font-medium text-xl')}>Answer</h3>
              </div>
              <Markdown>{`${parsedMessage}${texting}`}</Markdown>
              {loading && isLast ? null : (
                <div className="items-center relative h-6 justify-start rounded-xl p-1 flex">
                  <div className="flex flex-row absolute transition duration-100 left-0 top-3 items-center space-x-1 border border-gray-300/20 rounded-xl text-wrap p-1 md:border-token-border-light md:hidden md:group-hover/showoption:md:block">
                    <button onClick={()=>{
                      // console.log(parsedMessage)
                      translater(parsedMessage)
                    }} className="p-2 rounded-xl hover:bg-transparent/10 active:scale-95 transition duration-200">
                      <Languages size={18} />
                    </button>
                    <Rewrite rewrite={rewrite} messageId={message.id} />
                    <Copy initialMessage={message.content} message={message} />
                    <button
                      onClick={() => {
                        if (speechStatus === 'started') {
                          stop();
                        } else {
                          start();
                        }
                      }}
                      className="p-2 rounded-xl hover:bg-transparent/10 active:scale-95 transition duration-200"
                    >
                      {speechStatus === 'started' ? (
                        <StopCircle size={18} />
                      ) : (
                        <Volume2 size={18} />
                      )}
                    </button>
                    {/* <button
                      onClick={() => {
                        var num = rate + 1;
                        setRate(num);
                        if (num >= rates.length) {
                          setRate(0);
                        }
                      }}
                      className="p-2 h-auto rounded-xl hover:bg-transparent/10 active:scale-95 transition duration-200" 
                    >
                      <span>{rate == 0 ? -0.5 : rate}</span><FastForward size={18} />
                    </button> */}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-full lg:w-3/12 z-30 h-full pb-4">
            <SearchImages
              query={history[messageIndex - 1].content}
              chat_history={history.slice(0, messageIndex - 1)}
            />
            <SearchVideos
              chat_history={history.slice(0, messageIndex - 1)}
              query={history[messageIndex - 1].content}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default MessageBox;
