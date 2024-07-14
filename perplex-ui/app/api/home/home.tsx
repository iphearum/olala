import { useCreateReducer } from '@/hooks/useCreateReducer';
import homeContext from './home.context';
import { homeInitialState, initialState } from './home.state';
import { GetServerSideProps } from 'next';

export const Home = ({}) => {
  const contextValue = useCreateReducer<homeInitialState>({
    initialState,
  });
  const {
    state: {
      appName,
      apiKey,
      socket,
      socketId,
      lightMode,
      folders,
      conversations,
      selectedConversation,
      prompts,
      temperature,
    },
    dispatch,
  } = contextValue;

  return (
    <homeContext.Provider
      value={{
        ...contextValue,
      }}
    ></homeContext.Provider>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  let serverSidePluginKeysSet = false;

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCSEId = process.env.GOOGLE_CSE_ID;

  const appName = process.env.APP_NAME || 'Open Brain';

  if (googleApiKey && googleCSEId) {
    serverSidePluginKeysSet = true;
  }

  return {
    props: {
      appName,
      serverSidePluginKeysSet,
    },
  };
};
