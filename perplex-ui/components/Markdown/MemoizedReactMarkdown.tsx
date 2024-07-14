import { FC, memo } from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import 'katex/dist/katex.min.css';
import '@/lib/custom.css';

export const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
