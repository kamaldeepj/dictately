'use client';

import { useState, useEffect } from 'react';
import { Mic, Copy, Check } from 'lucide-react';

export function TranscriptionDemo() {
  const [status, setStatus] = useState<'recording' | 'processing' | 'complete'>('recording');
  const [displayedText, setDisplayedText] = useState('');
  const [copied, setCopied] = useState(false);

  const sampleText = "Hi Sarah, I wanted to follow up on our meeting yesterday. The project timeline looks good, and we should be able to deliver the first phase by next Friday. Let me know if you have any questions or concerns. Thanks!";

  useEffect(() => {
    // Simulate recording phase
    const recordingTimer = setTimeout(() => {
      setStatus('processing');
    }, 1500);

    // Simulate processing phase
    const processingTimer = setTimeout(() => {
      setStatus('complete');
      // Start typing animation
      const words = sampleText.split(' ');
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex < words.length) {
          setDisplayedText((prev) => 
            prev + (prev ? ' ' : '') + words[currentIndex]
          );
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 100); // Adjust speed here (lower = faster)

      return () => clearInterval(typingInterval);
    }, 2500);

    return () => {
      clearTimeout(recordingTimer);
      clearTimeout(processingTimer);
    };
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-lg shadow-lg overflow-hidden bg-white border border-gray-200">
      <div className="p-6">
        {/* Header with status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`relative ${status === 'recording' ? 'animate-pulse' : ''}`}>
              <Mic className={`h-5 w-5 ${status === 'recording' ? 'text-red-500' : status === 'processing' ? 'text-orange-500' : 'text-green-500'}`} />
              {status === 'recording' && (
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {status === 'recording' && 'Recording...'}
              {status === 'processing' && 'Processing...'}
              {status === 'complete' && 'Transcription Complete'}
            </span>
          </div>
          {status === 'complete' && (
            <button
              onClick={copyToClipboard}
              className="text-gray-400 hover:text-orange-500 transition-colors"
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Transcription text */}
        <div className="min-h-[200px] bg-gray-50 rounded-md p-4 border border-gray-100">
          {status === 'recording' && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">Speak now...</p>
            </div>
          )}
          {status === 'processing' && (
            <div className="flex items-center justify-center h-full">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          {status === 'complete' && (
            <div className="text-gray-800 text-base leading-relaxed">
              {displayedText}
              {displayedText.length < sampleText.length && (
                <span className="inline-block w-2 h-5 bg-orange-500 ml-1 animate-pulse"></span>
              )}
            </div>
          )}
        </div>

        {/* Footer stats */}
        {status === 'complete' && displayedText.length === sampleText.length && (
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Processed in 2.3 seconds</span>
            <span>98% accuracy</span>
          </div>
        )}
      </div>
    </div>
  );
}

