"use client"

import homeContext from '@/app/api/home/home.context';
import { homeInitialState, initialState } from '@/app/api/home/home.state';
import { useCreateReducer } from '@/hooks/useCreateReducer';
import { useStorage } from '@/hooks/useHook';
import { useSocket } from '@/hooks/useSocket';
import Layout from './Layout';
import { memo, useEffect, useMemo } from 'react';

interface Props {
  children: React.ReactNode
}

const Home = memo(({ children }: Props ) => {
  const [theme, setTheme] = useStorage('theme', 'dark');
  const ws = useSocket(process.env.NEXT_PUBLIC_WS_URL!);
  const contextValue = useCreateReducer<homeInitialState>({initialState});
  const {
    state: { lightMode },
    dispatch
  } = contextValue;

  // const updateState = (key: any, value: any) => {
  //   dispatch({
  //     field: key,
  //     value: value
  //   })
  // };

  useMemo(()=>{
    dispatch({
      field: 'socket',
      value: ws,
    });
    dispatch({
      field: 'loading',
      value: false
    })
  }, [ws])

  useEffect(() => {
    dispatch({
      field: 'lightMode',
      value: theme,
    });
  }, []);
  
  return (
    <homeContext.Provider value={{ ...contextValue }}>
      <main className={lightMode}>
        <Layout>{children}</Layout>
      </main>
    </homeContext.Provider>
  );
});

export default Home;
