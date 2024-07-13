'use client';
import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import homeContext from '@/app/api/home/home.context';
import MessageInput from './MessageInput';
import { useStorage } from '@/hooks/useHook';

interface Props {
  children: React.ReactNode
}

interface TypeFocusMode {
  focusMode: string;
  setFocusMode: (mode: string) => void;
}

const Layout = memo(({ children }: Props) => {

  const [dividerWidth, setDividerWidth] = useState(0);
  const [focus, setFocus] = useStorage('focusMode',"llmChat")

  const dividerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateDividerWidth = () => {
      if (dividerRef.current) {
        setDividerWidth(dividerRef.current.scrollWidth);
      }
    };

    updateDividerWidth();

    window.addEventListener('resize', updateDividerWidth);

    return () => {
      window.removeEventListener('resize', updateDividerWidth);
    };
  });
  return (
    <div className='text-white flex flex-row justify-between bg-[var(--main-surface-primary)] text-[var(--text-primary)]'>
      <Sidebar />
      {/* showChatbar?'lg:pl-80':"lg:pl-30", */}
      <div className={cn('min-h-screen w-full max-w-screen-lg')}>
        <div className="max-w-screen-lg relative lg:mx-auto mx-4">
          {children}
          {/* {dividerWidth > 0 && (
            <div
              className="bottom-24 lg:bottom-10 fixed z-40"
              style={{ width: dividerWidth }}
            >
              <MessageInput />
            </div>)} */}
          <div className="bottom-24 lg:bottom-10 fixed z-40 lg:w-[38%]">
            <MessageInput focusMode={focus} setFocusMode={setFocus} />
          </div>
        </div>
      </div>
      <div className='w-auto'></div>
    </div>
  );
});

export default Layout;
