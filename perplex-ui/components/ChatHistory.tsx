import { genUrlId, uuid } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MessageCircleMoreIcon } from "lucide-react";
import Link from "next/link";
import { FC, memo } from "react";

interface Props { className: string; active: string; panel: string; }

export const ChatHistory: FC<Props> = memo((props: any) => {
    return (
        <div {...props}>
            <div className={cn("h-full py-1 justify-between space-y-1 animate duration-700 transition", !eval(props.panel) && 'hidden')}>
                <div className="p-2 rounded-md bg-[var(--sidebar-surface-primary)]">
                    <h2 className="pb-3">Chat History</h2>
                    <input type="text" placeholder="Search..." className="w-full h-[36px] px-2 text-[var(--text-secondary)] rounded-lg bg-[var(--sidebar-surface-secondary)] overflow-hidden" />
                </div>
                <div className="relative w-full h-screen-nav bg-[var(--sidebar-surface-primary)] overflow-y-auto no-scrollbar rounded-md">
                    <div className="rounded-md h-full px-2 py-0.5">
                        {[1, 2, 3, 4, 5, 6, 8, 9].map((e) => {
                            const active = props.active == e
                            return (
                                <Link
                                    key={e + uuid()}
                                    href={`/chat/${e}`}
                                    className={cn(
                                        'relative flex flex-row items-center rounded-md my-2 py-2 px-2 space-x-4 cursor-pointer active:scale-95 hover:scale-90 transition duration-200 bg-[var(--main-surface-primary)] hover:bg-[var(--main-surface-tertiary)]',
                                        active ? 'bg-[var(--main-surface-tertiary)] drop-shadow-sm' : null
                                    )}
                                >
                                    <MessageCircleMoreIcon /> {` chat ${e}`}
                                    {/* {active?<div className="absolute right-0 -mr-2 h-full w-1 rounded-l-lg bg-white" />:null} */}
                                    {/* <button onClick={()=>{
                                    const uid = genUrlId()
                                    console.log(uid)
                                }}>GEN</button> */}
                                </Link>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    )
})

export default ChatHistory;