'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Loader2, CheckCircle2, Send, AlertCircle, Volume2, Square, Server, Target, Cpu, RefreshCw } from 'lucide-react';

const UI = {
  EN: {
    title: "Speak your problem",
    subtitle: "Voice-powered civic assistant for Bangladesh",
    tapToSpeak: "Tap to speak",
    listening: "Listening...",
    tapToStop: "Tap to Stop",
    instruction: "When you are finished speaking, click the Stop button to automatically submit and process your report.",
    cancel: "Cancel",
    confirm: "Confirm",
    successAlert: "Your report has been successfully recorded.",
    completed: "Action Completed",
    startNew: "Start New Request",
    oops: "Oops",
    tryAgain: "Try Again",
    agentSteps: [
      { id: 1, text: "Connecting to Neural Voice Engine", icon: Server },
      { id: 2, text: "Extracting rural dialects & keywords", icon: Volume2 },
      { id: 3, text: "Structuring civic intent payload", icon: Target },
      { id: 4, text: "Cross-referencing municipality database", icon: Cpu },
      { id: 5, text: "Drafting final actionable report", icon: CheckCircle2 }
    ]
  },
  BN: {
    title: "আপনার সমস্যার কথা বলুন",
    subtitle: "বাংলাদেশের জন্য ভয়েস-চালিত নাগরিক এআই",
    tapToSpeak: "কথা বলতে ট্যাপ করুন",
    listening: "আমি শুনছি...",
    tapToStop: "রেকর্ডিং বন্ধ করুন",
    instruction: "কথা বলা শেষ হলে, স্বয়ংক্রিয়ভাবে আপনার রিপোর্ট প্রসেস করতে স্টপ বাটনে ক্লিক করুন।",
    cancel: "বাতিল করুন",
    confirm: "নিশ্চিত করুন",
    successAlert: "আপনার রিপোর্টটি সফলভাবে জমা দেওয়া হয়েছে।",
    completed: "পদক্ষেপ সম্পন্ন হয়েছে",
    startNew: "নতুন সমস্যা জানান",
    oops: "দুঃখিত",
    tryAgain: "আবার চেষ্টা করুন",
    agentSteps: [
      { id: 1, text: "ভয়েস ইঞ্জিন কানেক্ট করা হচ্ছে", icon: Server },
      { id: 2, text: "কন্ঠস্বর এবং সমস্যার ধরণ সনাক্ত করা হচ্ছে", icon: Volume2 },
      { id: 3, text: "নাগরিক তথ্যে রূপান্তর করা হচ্ছে", icon: Target },
      { id: 4, text: "সরকারি ডাটাবেস যাচাই করা হচ্ছে", icon: Cpu },
      { id: 5, text: "রিপোর্ট প্রস্তুত করা হচ্ছে", icon: CheckCircle2 }
    ]
  }
};

export default function Home() {
  const [appState, setAppState] = useState('IDLE'); 
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [language, setLanguage] = useState('EN'); 
  
  // Agentic Processing states
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Mocking the agentic step progress during loading phases
  useEffect(() => {
    let interval;
    if (appState === 'TRANSCRIBING' || appState === 'PROCESSING') {
      setActiveStepIndex(0);
      interval = setInterval(() => {
        setActiveStepIndex(prev => (prev < 4 ? prev + 1 : prev));
      }, 1500); // Step advances every 1.5s
    }
    return () => clearInterval(interval);
  }, [appState]);

  const startRecording = async () => {
    try {
      setTranscript('');
      setErrorMsg('');
      setParsedData(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await handleAudioUpload(audioBlob);
      };

      mediaRecorder.start();
      setAppState('LISTENING');
    } catch (err) {
      console.error(err);
      setErrorMsg('Microphone access denied. Please allow microphone permissions in your browser address bar.');
      setAppState('ERROR');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setAppState('TRANSCRIBING');
    }
  };

  const handleAudioUpload = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
         // Check if it's the specific OpenRouter Guardrail Error to give a helpful message
         if (data.error && data.error.includes("guardrail")) {
             throw new Error("OpenRouter Privacy Error! You must visit https://openrouter.ai/settings/privacy and disable \"Require Zero Data Retention\" because OpenAI audio models require standard data permissions.");
         }
         throw new Error(data.error || 'Failed to transcribe audio.');
      }

      const text = data.text;
      setTranscript(text);
      
      setAppState('PROCESSING');
      await processIntent(text);

    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Server error during transcription.');
      setAppState('ERROR');
    }
  };

  const processIntent = async (textToProcess) => {
    if (!textToProcess || !textToProcess.trim()) {
      setErrorMsg('We could not hear any speech. Please try again.');
      setAppState('ERROR');
      return;
    }
    
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
      setErrorMsg('Failed to structure the request intent. Please try again.');
      setAppState('ERROR');
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
      setErrorMsg('Failed to submit action to the database.');
      setAppState('ERROR');
    }
  };

  const reset = () => {
    setAppState('IDLE');
    setTranscript('');
    setParsedData(null);
    setErrorMsg('');
    setActiveStepIndex(0);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch(e) {}
    }
  };

  const currentUI = UI[language];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] font-sans antialiased selection:bg-slate-200">
      
      {/* Top Header Row */}
      <header className="w-full flex justify-between items-center p-6 md:px-10">
        <div className="flex items-center gap-3">
          <div className="text-xl drop-shadow-sm">🇧🇩</div>
          <span className="font-bold text-slate-800 text-[1.1rem] tracking-tight">NagrikAI</span>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm text-slate-600 rounded-full px-4 py-1.5 text-sm font-bold">
             {appState === 'IDLE' && <><Mic size={14} className="opacity-70" /> {language === 'EN' ? 'Ready' : 'প্রস্তুত'}</>}
             {appState === 'LISTENING' && <><Mic size={14} className="text-red-500 animate-pulse" /> {language === 'EN' ? 'Recording' : 'রেকর্ডিং...'}</>}
             {appState === 'TRANSCRIBING' && <><Loader2 size={14} className="spin-slow" /> AI Voice</>}
             {appState === 'PROCESSING' && <><Loader2 size={14} className="spin-slow" /> Agent</>}
             {appState === 'RESULT' && <><Target size={14} className="text-blue-600" /> Action</>}
             {appState === 'SUCCESS' && <><CheckCircle2 size={14} className="text-green-600" /> Done</>}
             {appState === 'ERROR' && <><AlertCircle size={14} className="text-red-500" /> Error</>}
          </div>
        </div>
      </header>

      {/* Main Content Center */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        
        {appState === 'IDLE' && (
          <div className="text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <h1 className="text-3xl md:text-[2rem] font-bold text-slate-800 mb-3 tracking-tight">{currentUI.title}</h1>
            <p className="text-slate-500 text-sm md:text-base font-medium mb-12">{currentUI.subtitle}</p>
            
            <button 
              onClick={startRecording}
              className="w-32 h-32 md:w-[130px] md:h-[130px] bg-white text-slate-600 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 hover:scale-[1.03] hover:text-blue-600 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:border-blue-100 transition-all active:scale-95 duration-200"
            >
              <Mic size={42} strokeWidth={2.5} />
            </button>
            <p className="mt-6 text-slate-400 text-sm font-bold tracking-wide uppercase">{currentUI.tapToSpeak}</p>

            <div className="mt-10 bg-white border border-slate-200 rounded-full p-1 flex shadow-sm w-[150px]">
              <button 
                onClick={() => setLanguage('EN')}
                className={`flex-1 text-[13px] py-1.5 font-bold rounded-full transition-colors ${language === 'EN' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('BN')}
                className={`flex-1 text-[13px] py-1.5 font-bold rounded-full transition-colors ${language === 'BN' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                বাংলা
              </button>
            </div>
          </div>
        )}

        {appState === 'LISTENING' && (
          <div className="text-center flex flex-col items-center animate-in fade-in zoom-in duration-300 px-6">
            <div className="relative mb-6">
               <div className="absolute inset-0 border-[6px] border-red-500 rounded-full animate-ping opacity-20"></div>
               <button 
                  onClick={stopRecording}
                  className="relative z-10 w-[130px] h-[130px] bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow-[0_0_0_12px_rgba(239,68,68,0.1)] border border-red-200 active:scale-95 transition-all"
                >
                  <Square size={38} fill="currentColor" />
                </button>
            </div>
            
            <h1 className="text-[2rem] font-bold text-slate-800 mb-2">{currentUI.listening}</h1>
            <p className="text-red-500 font-bold text-[15px] underline tracking-wide uppercase mb-4 cursor-pointer" onClick={stopRecording}>
              {currentUI.tapToStop}
            </p>
            
            {/* Added Instruction Text Below the Button */}
            <div className="mt-4 bg-blue-50/50 border border-blue-100 p-4 rounded-xl max-w-sm">
               <p className="text-slate-600 font-medium text-[15px] leading-relaxed">
                 {currentUI.instruction}
               </p>
            </div>
          </div>
        )}

        {(appState === 'TRANSCRIBING' || appState === 'PROCESSING') && (
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-start animate-in fade-in zoom-in duration-300">
            
            <div className="flex items-center gap-3 mb-6 w-full pb-4 border-b border-slate-100">
               <RefreshCw size={20} className="text-blue-500 spin-slow" />
               <h2 className="text-xl font-bold text-slate-800">
                Agent Processing...
               </h2>
            </div>
            
            <div className="space-y-5 w-full">
               {currentUI.agentSteps.map((step, index) => {
                  const isActive = index === activeStepIndex;
                  const isChecked = index < activeStepIndex;
                  const StepIcon = step.icon;
                  
                  return (
                    <div 
                      key={step.id} 
                      className={`flex items-center gap-4 transition-all duration-500 ${
                        isChecked ? 'opacity-100' : isActive ? 'opacity-100 translate-x-1' : 'opacity-30'
                      }`}
                    >
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500
                          ${isChecked ? 'bg-green-50 text-green-600 border-green-200' 
                          : isActive ? 'bg-blue-50 text-blue-600 border-blue-200' 
                          : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                        >
                          {isChecked ? <CheckCircle2 size={16} /> : <StepIcon size={14} />}
                       </div>
                       <span className={`font-semibold text-[15px] ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                         {step.text}
                       </span>
                    </div>
                  );
               })}
            </div>
          </div>
        )}

        {appState === 'RESULT' && parsedData && (
          <div className="w-full max-w-lg bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 animate-in fade-in slide-in-from-bottom-8 duration-500">
             
             <div className="mb-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Target size={24} />
                </div>
                <h2 className="text-[1.8rem] font-bold text-slate-800 tracking-tight leading-none mb-3">
                  {parsedData.intent}
                </h2>
                <div className="inline-flex py-1 px-3 bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-full font-bold">
                  {language === 'EN' ? 'Confidence' : 'নিশ্চয়তা'}: {Math.round((parsedData.confidence || 0) * 100)}%
                </div>
            </div>

            <div className="space-y-6">
               {transcript && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{language === 'EN' ? 'Voice Transcript' : 'ভয়েস ট্রান্সক্রিপ্ট'}</span>
                    <p className="text-slate-700 italic border-l-2 border-slate-200 pl-4 py-1 text-[15px] leading-relaxed">&quot;{transcript}&quot;</p>
                  </div>
                )}

                <div className="bg-[#f8fafc] border border-slate-200 p-5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{language === 'EN' ? 'Agent Summary' : 'এজেন্ট সারসংক্ষেপ'}</span>
                  <p className="text-slate-800 font-bold text-[17px] leading-snug">{parsedData.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-6 px-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{language === 'EN' ? 'Category' : 'বিভাগ'}</span>
                    <p className="text-slate-800 font-bold">{parsedData.category}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{language === 'EN' ? 'Priority' : 'জরুরী'}</span>
                    <p className={`font-black ${parsedData.priority === 'High' ? 'text-red-600' : 'text-slate-800'}`}>
                      {parsedData.priority}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{language === 'EN' ? 'Detected Location' : 'স্থান'}</span>
                    <p className="text-slate-800 font-bold">{parsedData.location}</p>
                  </div>
                </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={reset}
                className="flex-1 py-4 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all active:scale-95"
              >
                {currentUI.cancel}
              </button>
              <button 
                onClick={confirmAction}
                className="flex-1 py-4 bg-slate-800 text-white border-2 border-slate-800 rounded-xl font-bold hover:bg-slate-700 transition-all active:scale-95"
              >
                {currentUI.confirm}
              </button>
            </div>
          </div>
        )}

        {appState === 'SUCCESS' && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 border-4 border-green-100">
              <CheckCircle2 size={40} strokeWidth={3} />
            </div>
            <h2 className="text-[2rem] font-bold text-slate-800 mb-3">{currentUI.completed}</h2>
            <p className="text-slate-500 font-medium mb-10 w-full max-w-[280px] mx-auto">{currentUI.successAlert}</p>
            
            <button 
              onClick={reset}
              className="px-10 py-4 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-700 transition-all active:scale-95 shadow-md"
            >
              {currentUI.startNew}
            </button>
          </div>
        )}

        {appState === 'ERROR' && (
          <div className="text-center max-w-sm animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
              <AlertCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">{currentUI.oops}</h2>
            <p className="text-slate-600 mb-8 font-medium bg-white p-4 rounded-xl border border-red-100">{errorMsg}</p>
            <button 
              onClick={reset}
              className="px-10 py-4 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-700 transition-all active:scale-95 shadow-md"
            >
              {currentUI.tryAgain}
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full pb-8 pt-4">
        <p className="text-center text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">
          NagrikAI — Civic Voice Assistant • Hackathon MVP
        </p>
      </footer>

    </div>
  );
}
