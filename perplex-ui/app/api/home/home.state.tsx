import { useMessage } from "@/hooks/useMessage";
import { Message } from "@/types/chat";

interface useMessageT {
  message: string;
  sendMessage: (message: string, callback?: (response: string) => void) => void;
  watchMessage: (listener: (message: string) => void) => void;
}

export interface homeInitialState {
  appName: string;
  apiKey: string;
  socket: any;
  socketId: any;
  loading: boolean;
  focusMode: string;
  copilotEnabled: boolean;
  urlchatid: string;
  panel: boolean;
  message: string;
  useMessage: useMessageT;
  messages: Message[];
  messageAppeared: boolean;
  
  service: 'openai' | 'meta' | string;
  lightMode: 'light' | 'dark' | string | undefined;
  language: string;
  models: [];
  folders: [];
  conversations: [];
  prompts: [];
  selectedConversation: any;
  currentMessage: any;
  messageIsStreaming: boolean;
  temperature: number;
  showChatbar: boolean;
  showPromptbar: boolean;
  messageError: boolean;
  searchTerm: string;
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
}

export const initialState: homeInitialState = {
  appName: 'Open Brain',
  apiKey: '',
  socket: undefined,
  socketId: undefined,
  loading: false,
  focusMode: 'llmChat',
  copilotEnabled: false,
  urlchatid: '',
  panel: true,
  message: '',
  messages: [],
  messageAppeared: false,
  useMessage: {
    message: '',
    sendMessage: () => {},
    watchMessage: () => {},
  },

  service: 'facebook',
  lightMode: 'dark',
  messageIsStreaming: false,
  models: [],
  folders: [],
  conversations: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  prompts: [],
  temperature: 1,
  showPromptbar: true,
  showChatbar: true,
  messageError: false,
  searchTerm: '',
  serverSideApiKeyIsSet: false,
  serverSidePluginKeysSet: false,
  language: 'default',
};
