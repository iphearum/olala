import {
  BadgePercent,
  ChevronDown,
  CopyPlus,
  Globe,
  MessageCircleMoreIcon,
  Pencil,
  ScanEye,
  SwatchBook,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, Switch, Transition } from '@headlessui/react';
import { SiReddit, SiYoutube } from '@icons-pack/react-simple-icons';
import { Fragment, memo, useCallback, useContext, useEffect } from 'react';
import homeContext from '@/app/api/home/home.context';
import { useStorage } from '@/hooks/useHook';

export const Attach = () => {
  return (
    <button
      type="button"
      className="p-2 rounded-full text-box dark:text-[var(--text-dark-box)] hover:shadow-sm hover:bg-[var(--main-surface-primary)] transition duration-200"
    >
      <CopyPlus />
    </button>
  );
};

const focusModes = [
  {
    key: 'llmChat',
    title: 'Chat',
    description: 'Chat with all existing datas',
    icon: <MessageCircleMoreIcon size={20} />,
    selected: true,
  },
  {
    key: 'webSearch',
    title: 'All',
    description: 'Searches across all of the internet',
    icon: <Globe size={20} />,
  },
  {
    key: 'academicSearch',
    title: 'Academic',
    description: 'Search in published academic papers',
    icon: <SwatchBook size={20} />,
  },
  {
    key: 'writingAssistant',
    title: 'Writing',
    description: 'Chat without searching the web',
    icon: <Pencil size={16} />,
  },
  {
    key: 'wolframAlphaSearch',
    title: 'Wolfram Alpha',
    description: 'Computational knowledge engine',
    icon: <BadgePercent size={20} />,
  },
  {
    key: 'youtubeSearch',
    title: 'Youtube',
    description: 'Search and watch videos',
    icon: (
      <SiYoutube
        className="h-5 w-auto mr-0.5"
        onPointerOverCapture={undefined}
        onPointerMoveCapture={undefined}
      />
    ),
  },
  {
    key: 'redditSearch',
    title: 'Reddit',
    description: 'Search for discussions and opinions',
    icon: (
      <SiReddit
        className="h-5 w-auto mr-0.5"
        onPointerOverCapture={undefined}
        onPointerMoveCapture={undefined}
      />
    ),
  },
];


export const Focus = memo(() => {
  const {
    state: {focusMode},
    dispatch
  } = useContext(homeContext)
  const [focus, setFocus] = useStorage('useCopilot', focusMode)
  
  useEffect(()=>{
    dispatch({field: "focusMode", value: focus});
  },[focus])
  return (
    <Popover className="w-full max-w-[15rem] md:max-w-md lg:max-w-lg">
      <Popover.Button
        type="button"
        className="p-2 text-[var(--text-primary)] hover:shadow-sm rounded-xl hover:bg-[var(--main-surface-primary)] active:scale-95 transition duration-200"
      >
        {focusMode !== 'webSearch' ? (
          <div className="flex flex-row items-center space-x-1">
            {focusModes.find((mode) => mode.key === focusMode)?.icon}
            <p className="text-xs font-medium">
              {focusModes.find((mode) => mode.key === focusMode)?.title}
            </p>
            <ChevronDown size={20} />
          </div>
        ) : (
          <ScanEye />
        )}
      </Popover.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute bottom-20 z-10 w-full max-w-screen-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-[var(--main-surface-primary)] shadow-sm border rounded-lg border-[var(--main-surface-secondary)] w-full p-2 max-h-[200px] md:max-h-none overflow-y-auto">
            {focusModes.map((mode, i) => (
              <Popover.Button
                onClick={() => setFocus(mode.key)}
                key={i}
                className={cn(
                  'p-2 rounded-lg flex flex-col text-[var(--text-primary)] bg-[var(--main-surface-secondary)] items-start justify-start text-start space-y-2 duration-200 cursor-pointer transition',
                  focusMode === mode.key
                    ? 'bg-[var(--main-surface-tertiary)]'
                    : 'hover:bg-[var(--main-surface-tertiary)]',
                )}
              >
                <div
                  className={cn(
                    'flex flex-row items-center space-x-1',
                    focusMode === mode.key ? 'text-[#24A0ED]' : null,
                  )}
                >
                  {mode.icon}
                  <p className="text-sm font-medium">{mode.title}</p>
                </div>
                <p className="text-[var(--text-secondary)] text-xs">{mode.description}</p>
              </Popover.Button>
            ))}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
});

export const CopilotToggle = memo(() => {
  const {
    state: {
      copilotEnabled
    },
    dispatch
  } = useContext(homeContext)

  const [copilot, setCopilot] = useStorage('useCopilot', copilotEnabled)
  
  useEffect(()=>{
    dispatch({field: "copilotEnabled", value: copilot});
  },[copilot])
  return (
    <div className="group text-box dark:text-[var(--text-dark-box)] drop-shadow-md flex flex-row items-center space-x-1 active:scale-95 duration-200 transition cursor-pointer">
      <Switch
        checked={copilotEnabled}
        onChange={() => setCopilot(!copilot)}
        className="bg-[var(--main-surface-primary)] relative inline-flex h-5 w-10 sm:h-6 sm:w-11 items-center rounded-full"
      >
        <span className="sr-only">Copilot</span>
        <span
          className={cn(
            copilotEnabled
              ? 'translate-x-6 bg-[#24A0ED]'
              : 'translate-x-1 bg-[var(--text-secondary)]',
            'inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full transition-all duration-200',
          )}
        />
      </Switch>
      <p
        onClick={() => setCopilot(!copilot)}
        className={cn(
          'text-xs font-medium transition-colors duration-150 ease-in-out',
          copilotEnabled
            ? 'text-[#24A0ED]'
            : 'group-hover:text-dark',
        )}
      >
        Copilot
      </p>
    </div>
  );
});
