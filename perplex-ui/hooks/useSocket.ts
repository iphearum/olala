import { useState, useEffect, memo, useMemo } from 'react';
import WebSocket, { Socket } from 'socket.io-client';
import { toast } from 'sonner';

export const useSocket = (url: string) => {
  const [ws, setWs] = useState<Socket | null>(null);
  const connectWs = async () => {
    const wsURL = new URL(url);
    const searchParams = new URLSearchParams({});
    wsURL.search = searchParams.toString();
    const wsurl = wsURL.toString();
    const ws = WebSocket(wsurl);
    // {
    //   transports: ['websocket'],
    //   reconnectionDelayMax: 10000,
    // }
    ws.on('connect', () => {
      // console.log('[DEBUG] open');
      setWs(ws);
    });

    // ws.on(`message-${ws.id}`, (e) => {
    //   const parsedData = JSON.parse(e);
    //   if (parsedData.type === 'error') {
    //     toast.error(parsedData.data);
    //     if (parsedData.key === 'INVALID_MODEL_SELECTED') {
    //       localStorage.clear();
    //     }
    //   }
    // });
  };

  useEffect(() => {
    if (!ws) {
      connectWs();
    }
    return () => {
      ws?.close();
      // console.log('[DEBUG] closed');
    };
  }, [ws, url]);

  return ws;
};
