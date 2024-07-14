import { Dispatch, createContext, useContext } from 'react';
import { ActionType } from '@/hooks/useCreateReducer';
import { homeInitialState } from './home.state';

export interface HomeContextProps {
  state: homeInitialState;
  dispatch: Dispatch<ActionType<homeInitialState>>;
  // useSocket: () => void;
  // handleNewConversation: () => void;
  // handleCreateFolder: (name: string, type: FolderType) => void;
  // handleDeleteFolder: (folderId: string) => void;
  // handleUpdateFolder: (folderId: string, name: string) => void;
  // handleSelectConversation: (conversation: Conversation) => void;
  // handleUpdateConversation: (
  //   conversation: Conversation,
  //   data: KeyValuePair,
  // ) => void;
}

const homeContext = createContext<HomeContextProps>(undefined!);

export default homeContext;
