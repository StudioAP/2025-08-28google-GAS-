
import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './icons';

interface CodeOutputProps {
  code: string;
}

export const CodeOutput: React.FC<CodeOutputProps> = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <div className="relative h-full w-full bg-gray-900 rounded-lg border border-gray-700">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all"
        aria-label="Copy code"
      >
        {isCopied ? (
          <CheckIcon className="w-5 h-5 text-green-400" />
        ) : (
          <ClipboardIcon className="w-5 h-5" />
        )}
      </button>
      <pre className="h-full w-full overflow-auto p-4 pt-12 text-sm text-gray-200 rounded-lg">
        <code>{code}</code>
      </pre>
    </div>
  );
};
