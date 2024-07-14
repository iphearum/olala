import { IconCheck, IconClipboard, IconDownload } from '@tabler/icons-react';
import { FC, memo, useState } from 'react';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {
  atomDark,
  oneDark,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useTranslation } from 'next-i18next';

import {
  generateRandomString,
  programmingLanguages,
} from '@/lib/app/codeblock';

interface Props {
  language: string;
  value: string;
}

export const CodeBlock: FC<Props> = memo(({ language, value }) => {
  const { t } = useTranslation('markdown');
  const [isCopied, setIsCopied] = useState<Boolean>(false);
  const [color, setColor] = useState('rgb(40, 44, 52)');

  language = language == '' ? 'md' : language;

  const copyToClipboard = () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      return;
    }

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };
  const downloadAsFile = () => {
    const fileExtension = programmingLanguages[language] || `.${language}`;
    const suggestedFileName = `openkh-code-${generateRandomString(10, true)}${fileExtension}`;
    const fileName = window.prompt(
      t('Enter file name') || '',
      suggestedFileName,
    );

    if (!fileName) {
      // user pressed cancel on prompt
      return;
    }

    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="codeblock group/code relative font-sans text-[1rem] inline-block">
      <div className="absolute flex items-center justify-between right-0 p-1 pr-auto">
        <div className="flex bg-gray-500/50 invisible group-hover/code:visible group-focus/code:visible items-center border rounded-md">
          <button
            className="flex gap-1.5 items-center rounded p-1 text-xs text-white"
            onClick={copyToClipboard}
          >
            {isCopied ? <IconCheck size={18} /> : <IconClipboard size={18} />}
            {isCopied ? t('Copied!') : language}
          </button>
          |
          <button
            className="flex items-center rounded bg-none p-1 text-xs text-white"
            onClick={downloadAsFile}
          >
            <IconDownload size={18} />
          </button>
        </div>
      </div>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          backgroundColor: '#11111',
          color: 'transparent',
          fontSize: 16,
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
});

// export const MathBlock: FC<Props> = memo(({}))

CodeBlock.displayName = 'CodeBlock';
