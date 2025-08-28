
import React, { useState, useCallback } from 'react';
import { FileInput } from './components/FileInput';
import { CodeOutput } from './components/CodeOutput';
import { Spinner } from './components/Spinner';
import { fileToBase64 } from './utils/fileProcessor';
import { ScriptIcon, AlertTriangleIcon, TypeIcon } from './components/icons';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setGeneratedScript('');
    setError('');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setGeneratedScript('');
    setError('');
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const handleGenerateClick = useCallback(async () => {
    if (files.length === 0 && inputText.trim() === '') {
      setError('Please provide text or select at least one file.');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedScript('');

    try {
      const filePayloads = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          type: file.type,
          data: await fileToBase64(file),
        }))
      );

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: filePayloads,
          inputText: inputText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      
      const { script } = await response.json();
      setGeneratedScript(script);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate script: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [files, inputText]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-3 text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
            <ScriptIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            <h1>GAS Slide Script Generator</h1>
          </div>
          <p className="mt-3 text-lg text-gray-400 max-w-3xl mx-auto">
            Paste your content or upload documents. The AI will analyze them and generate a Google Apps Script to create a professional presentation.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col">
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">1. Provide Content</h2>
            
            {/* Text Input Section */}
            <div>
              <label htmlFor="text-input" className="flex items-center gap-2 text-lg font-medium text-gray-300 mb-2">
                  <TypeIcon className="w-5 h-5" />
                  Paste Text
              </label>
              <textarea
                  id="text-input"
                  rows={8}
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-500"
                  placeholder="Paste your content here (e.g., meeting notes, project brief, article)..."
                  value={inputText}
                  onChange={handleTextChange}
                  aria-label="Paste text content"
              />
            </div>
            
            {/* Separator */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-800/50 px-3 text-sm font-medium text-gray-400 rounded-full">AND / OR</span>
                </div>
            </div>
            
            {/* File Input Section */}
            <div className="flex flex-col flex-grow">
              <FileInput
                onFilesSelected={handleFilesSelected}
                selectedFiles={files}
                clearFiles={clearFiles}
              />
            </div>

            <button
              onClick={handleGenerateClick}
              disabled={isLoading || (files.length === 0 && inputText.trim() === '')}
              className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Generating...
                </>
              ) : (
                'Generate Script'
              )}
            </button>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col relative min-h-[400px]">
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">2. Generated Script</h2>
            <div className="flex-grow relative">
              {isLoading && (
                <div className="absolute inset-0 bg-gray-800/50 flex flex-col items-center justify-center rounded-lg z-10">
                  <Spinner />
                  <p className="mt-2 text-gray-300">AI is generating your script...</p>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                    <div className="flex items-center">
                      <AlertTriangleIcon className="w-6 h-6 mr-2" />
                      <strong className="font-bold">Error!</strong>
                    </div>
                    <span className="block sm:inline ml-8">{error}</span>
                  </div>
                </div>
              )}
              {!isLoading && !error && !generatedScript && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500">Your generated script will appear here.</p>
                </div>
              )}
              {generatedScript && <CodeOutput code={generatedScript} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
