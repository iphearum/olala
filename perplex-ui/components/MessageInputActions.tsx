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
import { Fragment, useCallback, useEffect } from 'react';

export const Attach = () => {
  return (
    <button
      type="button"
      className="p-2 text-white/50 rounded-xl hover:bg-[#1c1c1c] transition duration-200 hover:text-white"
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

export const Focus = ({
  focusMode,
  setFocusMode,
}: {
  focusMode: string;
  setFocusMode: (mode: string) => void;
}) => {
  let focus: string = localStorage.getItem('useMode') ?? 'llmChat';
  useEffect(() => {
    setFocusMode(focus);
  }, []);
  return (
    <Popover className="fixed w-full max-w-[15rem] md:max-w-md lg:max-w-lg">
      <Popover.Button
        type="button"
        className="p-2 text-white/50 rounded-xl hover:bg-[#1c1c1c] active:scale-95 transition duration-200 hover:text-white"
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
        <Popover.Panel className="absolute z-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-[#0A0A0A] border rounded-lg border-[#1c1c1c] w-full p-2 max-h-[200px] md:max-h-none overflow-y-auto">
            {focusModes.map((mode, i) => (
              <Popover.Button
                onClick={() => {
                  setFocusMode(mode.key);
                  localStorage.setItem('useMode', `${mode.key}`);
                }}
                key={i}
                className={cn(
                  'p-2 rounded-lg flex flex-col items-start justify-start text-start space-y-2 duration-200 cursor-pointer transition',
                  focusMode === mode.key
                    ? 'bg-[#111111]'
                    : 'hover:bg-[#111111]',
                )}
              >
                <div
                  className={cn(
                    'flex flex-row items-center space-x-1',
                    focusMode === mode.key ? 'text-[#24A0ED]' : 'text-white',
                  )}
                >
                  {mode.icon}
                  <p className="text-sm font-medium">{mode.title}</p>
                </div>
                <p className="text-white/70 text-xs">{mode.description}</p>
              </Popover.Button>
            ))}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export const CopilotToggle = ({
  copilotEnabled,
  setCopilotEnabled,
}: {
  copilotEnabled: boolean;
  setCopilotEnabled: (enabled: boolean) => void;
}) => {
  return (
    <div className="group flex flex-row items-center space-x-1 active:scale-95 duration-200 transition cursor-pointer">
      <Switch
        checked={copilotEnabled}
        onChange={(val) => {
          setCopilotEnabled(val);
          localStorage.setItem('useCopilot', `${val}`);
        }}
        className="bg-[#111111] border border-[#1C1C1C] relative inline-flex h-5 w-10 sm:h-6 sm:w-11 items-center rounded-full"
      >
        <span className="sr-only">Copilot</span>
        <span
          className={cn(
            copilotEnabled
              ? 'translate-x-6 bg-[#24A0ED]'
              : 'translate-x-1 bg-white/50',
            'inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full transition-all duration-200',
          )}
        />
      </Switch>
      <p
        onClick={() => {
          setCopilotEnabled(!copilotEnabled);
          localStorage.setItem('useCopilot', `${!copilotEnabled}`);
        }}
        className={cn(
          'text-xs font-medium transition-colors duration-150 ease-in-out',
          copilotEnabled
            ? 'text-[#24A0ED]'
            : 'text-white/50 group-hover:text-white',
        )}
      >
        Copilot
      </p>
    </div>
  );
};
