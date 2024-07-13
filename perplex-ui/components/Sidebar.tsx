import homeContext from '@/app/api/home/home.context';
import { useStorage } from '@/hooks/useHook';
import { cn } from '@/lib/utils';
import { BookOpenText, Home, Search, SquarePen, Settings, PanelRightOpen, PanelRightClose, SunMoon, RemoveFormatting } from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import React, { memo, useContext, useEffect, useState } from 'react';
import SettingsDialog from './SettingsDialog';
import ChatHistory from './ChatHistory';


export const Sidebar = memo(() => {
    const {
        state: { lightMode, showChatbar, panel },
        dispatch,
    } = useContext(homeContext);
    const segments = useSelectedLayoutSegments();
    const [theme, setTheme] = useStorage('theme', lightMode)
    const [isPanel, setPanel] = useStorage('panel', panel)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [message, setMessage] = useStorage('messages', []);

    useEffect(() => {
        dispatch({
            field: 'urlchatid',
            value: segments[1]
        })
    }, [segments[1]])

    const setLightMode = (theme: string) => {
        dispatch({
            field: 'lightMode',
            value: theme,
        });
        setTheme(theme);
        console.log(theme)
    }

    const navLinks = [
        {
            icon: Home,
            href: '/',
            active: segments.length === 0,
            label: 'Home',
        },
        {
            icon: Search,
            href: '/discover',
            active: segments.includes('discover'),
            label: 'Discover',
        },
        {
            icon: BookOpenText,
            href: '/library',
            active: segments.includes('library'),
            label: 'Library',
        },
    ];
    return (
        <div className='sticky flex flex-row min-h-screen'>
            <div className="h-full p-0.5">
                <div className="flex grow bg-[var(--sidebar-surface-primary)] flex-col h-full items-center justify-between gap-y-5 overflow-y-auto rounded-lg px-2 py-8">
                    <div className="cursor-pointer" >
                        <button onClick={() => {
                            setPanel(!isPanel)
                            dispatch({
                                field: 'panel',
                                value: isPanel
                            })
                        }}>
                            {panel ? <PanelRightClose /> : <PanelRightOpen />}
                        </button>
                    </div>
                    <a href="/">
                        <SquarePen className="cursor-pointer " />
                    </a>
                    <div className="flex flex-col items-center gap-y-3 w-full ">
                        {navLinks.map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                className={cn('relative flex flex-row items-center justify-center cursor-pointer duration-150 transition w-full py-2 rounded-lg')}
                            >
                                <link.icon />
                                {link.active && (
                                    <div className="absolute right-0 -mr-2 h-full w-1 rounded-l-lg bg-[var(--sidebar-surface-secondary)]" />
                                )}
                            </Link>
                        ))}
                    </div>
                    {/* <Settings
                        onClick={() => {
                            // setIsSettingsOpen(!isSettingsOpen)
                        }}
                        className="text-white cursor-pointer"
                    /> */}
                    <div className='h-full'></div>
                    <div className='w-full flex-1'>
                        <RemoveFormatting
                            onClick={() => setMessage([])}
                            className={cn("text-dark dark:text-white cursor-pointer")}
                        />
                        <SunMoon
                            onClick={() => setLightMode(lightMode == 'dark' ? 'light' : 'dark')}
                            className={cn("text-dark dark:text-white cursor-pointer")}
                        />
                    </div>
                    <SettingsDialog
                        isOpen={isSettingsOpen}
                        setIsOpen={setIsSettingsOpen}
                    />
                </div>
            </div>
            <ChatHistory className="h-screen z-40" active={segments[1]} panel={panel.toString()} />

            <div className="fixed bottom-0 w-full z-50 flex flex-row items-center gap-x-6 px-4 py-4 shadow-sm lg:hidden">
                {navLinks.map((link, i) => (
                    <Link
                        href={link.href}
                        key={i}
                        className={cn(
                            'relative flex flex-col items-center space-y-1 text-center w-full',
                            link.active ? 'text-white' : 'text-white/70',
                        )}
                    >
                        {link.active && (
                            <div className="absolute top-0 -mt-4 h-1 w-full rounded-b-lg bg-white" />
                        )}
                        <link.icon />
                        <p className="text-xs">{link.label}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
});

export default Sidebar;