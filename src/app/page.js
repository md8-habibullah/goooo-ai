'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Loader2, CheckCircle2, Send, Edit, XCircle } from 'lucide-react';

export default function Home() {
  const [appState, setAppState] = useState('IDLE'); // IDLE, LISTENING, PROCESSING, RESULT, SUCCESS
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState(null);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        // recognitionRef.current.lang = 'bn-BD'; // Defaulting to Bangla, but user can speak English if model supports cross-lingua or if we set bilingual (usually better to set a specific locale, though some APIs try to auto-detect. We'll use bn-BD as requested or just the default)
        
        recognitionRef.current.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setAppState('IDLE');
        };

        recognitionRef.current.onend = () => {
          // When user stops speaking, if we were listening, transition to processing
          if (appState === 'LISTENING') {
            processIntent(transcript);
          }
        };
      } else {
        console.warn("Speech Recognition API not supported in this browser.");
      }
    }
  }, [appState, transcript]);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setAppState('LISTENING');
      try {
        recognitionRef.current.start();
      } catch(e) {
        // Handle case where recognition is already started
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 100);
      }
    } else {
      alert("Speech Recognition not supported in your browser.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && appState === 'LISTENING') {
      recognitionRef.current.stop();
    }
  };

  const processIntent = async (textToProcess) => {
    if (!textToProcess.trim()) {
      setAppState('IDLE');
      return;
    }
    
    setAppState('PROCESSING');
    
    try {
      const res = await fetch('/api/process-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToProcess })
      });
      
      if (!res.ok) throw new Error('API processing failed');
      
      const data = await res.json();
      setParsedData(data);
      setAppState('RESULT');
    } catch (error) {
      console.error(error);
      alert('Failed to understand the request. Please try again.');
      setAppState('IDLE');
    }
  };

  const confirmAction = async () => {
    setAppState('PROCESSING');
    try {
      const res = await fetch('/api/save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      });
      
      if (!res.ok) throw new Error('Saving failed');
      setAppState('SUCCESS');
    } catch (error) {
      console.error(error);
      alert('Failed to submit action.');
      setAppState('RESULT');
    }
  };

  const reset = () => {
    setAppState('IDLE');
    setTranscript('');
    setParsedData(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card text-card-foreground rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col">
        
        {/* Visual Status System header */}
        <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
          <h1 className="font-bold tracking-wide">Civic Assistant</h1>
          <div className="flex space-x-2 text-sm font-medium items-center">
            {appState === 'IDLE' && <span className="flex items-center gap-1"><Mic size={16}/> Ready</span>}
            {appState === 'LISTENING' && <span className="flex items-center gap-1 text-red-300 animate-pulse"><Mic size={16}/> Listening</span>}
            {appState === 'PROCESSING' && <span className="flex items-center gap-1 text-blue-300"><Loader2 size={16} className="spin-slow" /> Processing</span>}
            {appState === 'RESULT' && <span className="flex items-center gap-1 text-green-300"><CheckCircle2 size={16}/> Confirm</span>}
            {appState === 'SUCCESS' && <span className="flex items-center gap-1 text-green-300"><Send size={16}/> Submitted</span>}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="p-8 flex-1 flex flex-col items-center justify-center min-h-[400px]">
          
          {appState === 'IDLE' && (
            <div className="text-center w-full">
              <h2 className="text-2xl font-bold mb-8 text-foreground/80">Speak your problem</h2>
              <button 
                onClick={startListening}
                className="mx-auto w-32 h-32 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all active:scale-95"
              >
                <Mic size={48} />
              </button>
            </div>
          )}

          {appState === 'LISTENING' && (
            <div className="text-center w-full">
              <div className="mic-pulse mx-auto w-32 h-32 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg mb-8">
                <Mic size={48} />
              </div>
              <p className="text-lg text-muted-foreground animate-pulse mb-4">Listening...</p>
              <div className="bg-muted p-4 rounded-xl min-h-[100px] flex items-center justify-center">
                <p className="text-lg italic text-foreground/80">&quot;{transcript || 'Waiting for voice...'}&quot;</p>
              </div>
              <button 
                onClick={stopListening}
                className="mt-6 px-6 py-2 bg-secondary text-secondary-foreground rounded-full font-medium active:scale-95 transition-all"
              >
                Stop & Process
              </button>
            </div>
          )}

          {appState === 'PROCESSING' && (
            <div className="text-center w-full flex flex-col items-center">
              <Loader2 size={64} className="text-primary spin-slow mb-6" />
              <p className="text-xl font-medium text-foreground/80">
                {parsedData ? "Submitting Request..." : "Understanding your request..."}
              </p>
            </div>
          )}

          {appState === 'RESULT' && parsedData && (
            <div className="w-full">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2">
                  <span className="text-primary">Action:</span> {parsedData.intent}
                </h2>
                <div className="inline-block px-3 py-1 bg-muted rounded-full text-sm font-medium text-muted-foreground">
                  Confidence: {Math.round((parsedData.confidence || 0) * 100)}%
                </div>
              </div>
              
              <div className="space-y-4 bg-muted/50 p-5 rounded-xl border border-border">
                <div>
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Summary</span>
                  <p className="text-lg font-medium">{parsedData.summary}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Category</span>
                    <p className="font-medium">{parsedData.category}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Priority</span>
                    <p className={`font-medium ${parsedData.priority === 'High' ? 'text-destructive' : ''}`}>{parsedData.priority}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Location</span>
                    <p className="font-medium">{parsedData.location}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/80 transition-colors"
                >
                  <Edit size={18} /> Cancel / Edit
                </button>
                <button 
                  onClick={confirmAction}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  <CheckCircle2 size={18} /> Confirm
                </button>
              </div>
            </div>
          )}

          {appState === 'SUCCESS' && (
            <div className="text-center w-full">
              <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Action Completed</h2>
              <p className="text-muted-foreground mb-8">
                Your report has been successfully recorded in the system.
              </p>
              
              <button 
                onClick={reset}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                Start New Request
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
