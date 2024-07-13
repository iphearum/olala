import { ArrowLeftRight, RefreshCcw } from 'lucide-react';

const Rewrite = ({
  rewrite,
  messageId,
}: {
  rewrite: (messageId: string) => void;
  messageId: string;
}) => {
  return (
    <button
      onClick={() => rewrite(messageId)}
      className="p-2 rounded-xl hover:bg-transparent/10 transition duration-200"
    >
      <RefreshCcw size={18} />
    </button>
  );
};

export default Rewrite;
