'use client';

import React, { useContext, useState } from 'react';
import ChatWindow from '@/components/ChatWindow';
import { cn } from '@/lib/utils';
import { MessageCircleMoreIcon } from 'lucide-react';
import Link from 'next/link';
import homeContext from '@/app/api/home/home.context';
export default function App() {
  const {
    state: { socket, socketId },
    dispatch,
  } = useContext(homeContext);

  return (
    <div className='flex flex-row'>
      <ChatWindow className="w-full"/>
    </div>
  );
}
