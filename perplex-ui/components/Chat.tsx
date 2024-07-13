'use client';

import { memo, useContext, useEffect, useRef, useState } from 'react';
import MessageBox from './MessageBox';
import MessageBoxLoading from './MessageBoxLoading';
import homeContext from '@/app/api/home/home.context';

interface Props {
  rewrite: (messageId: string) => void;
}

const Chat = memo(({
  rewrite,
}: Props) => {
  const {
    state: {
      loading,
      messages,
      messageAppeared,
    }
  } = useContext(homeContext);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const messageEnd = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: 'smooth' });

    if (messages.length === 1) {
      document.title = `Open Brain | ${messages[0].content.substring(0, 30)}`;
    }
  }, [messages]);

  return (
    <div className="flex flex-col space-y-6 pt-3 pb-44 lg:pb-32 sm:mx-2 md:mx-0">
      {messages.map((msg: any, i) => {
        const isLast = i === messages.length - 1;

        return (
          <div key={i}>
            <MessageBox
              message={msg}
              messageIndex={i}
              history={messages}
              loading={loading}
              dividerRef={isLast ? dividerRef : undefined}
              isLast={isLast}
              rewrite={rewrite}
            />
            {!isLast && msg.role === 'assistant' && (
              <div className="h-px w-full bg-transparent" />
            )}
          </div>
        );
      })}
      {loading && !messageAppeared && <MessageBoxLoading />}
      <div ref={messageEnd} className="h-0" />
    </div>
  );
});

export default Chat;
