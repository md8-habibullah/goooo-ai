import { useState, useCallback, useEffect } from "react";
import { StatusHeader, type AppPhase } from "@/components/civic/StatusHeader";
import { MicButton } from "@/components/civic/MicButton";
import { TranscriptBox } from "@/components/civic/TranscriptBox";
import { ProcessingView } from "@/components/civic/ProcessingView";
import { ResultCard } from "@/components/civic/ResultCard";
import { ActionButtons } from "@/components/civic/ActionButtons";
import { SuccessView } from "@/components/civic/SuccessView";
import { LanguageToggle } from "@/components/civic/LanguageToggle";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { processIntent, saveReport, type IntentResult, type SavedReport } from "@/lib/intentProcessor";
import { toast } from "sonner";

const Index = () => {
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [savedReport, setSavedReport] = useState<SavedReport | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const speech = useSpeechRecognition();
  const geo = useGeolocation();
  const tts = useTextToSpeech();

  // Request location on mount
  useEffect(() => {
    geo.requestLocation();
  }, []);

  const handleStartListening = useCallback(() => {
    setPhase("listening");
    setIntentResult(null);
    setSavedReport(null);
    speech.startListening();
  }, [speech]);

  const handleStopListening = useCallback(async () => {
    speech.stopListening();
    const text = speech.transcript;

    if (!text.trim()) {
      setPhase("idle");
      return;
    }

    setPhase("processing");

    try {
      const result = await processIntent(text, geo.position);
      setIntentResult(result);
      setPhase("result");

      // Speak the AI response aloud
      if (result.voiceResponse) {
        const lang = speech.language === "bn-BD" ? "bn-BD" : "en-US";
        tts.speak(result.voiceResponse, lang);
      }
    } catch (err: any) {
      console.error("Intent processing failed:", err);
      toast.error(err.message || "Failed to process your request. Please try again.");
      setPhase("idle");
    }
  }, [speech, geo.position, tts]);

  const handleConfirm = useCallback(async () => {
    if (!intentResult) return;
    setSubmitting(true);
    try {
      const report = await saveReport(intentResult);
      setSavedReport(report);
      setPhase("success");
      tts.speak("Your report has been submitted successfully.", speech.language === "bn-BD" ? "bn-BD" : "en-US");
    } catch {
      toast.error("Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  }, [intentResult, tts, speech.language]);

  const handleReset = useCallback(() => {
    tts.stop();
    setPhase("idle");
    setIntentResult(null);
    setSavedReport(null);
  }, [tts]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StatusHeader
        phase={phase}
        actionLabel={intentResult?.actionLabel}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-10 gap-8">
        {/* IDLE SCREEN */}
        {phase === "idle" && (
          <>
            <div className="text-center mb-2 animate-fade-up">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Speak your problem
              </h2>
              <p className="text-muted-foreground text-base">
                Voice-powered civic assistant for Bangladesh
              </p>
              {geo.position && (
                <p className="text-xs text-muted-foreground mt-1">
                  📍 Location detected
                </p>
              )}
            </div>
            <MicButton
              isListening={false}
              onStart={handleStartListening}
              onStop={handleStopListening}
            />
            <LanguageToggle
              language={speech.language}
              onChange={speech.setLanguage}
            />
            {!speech.isSupported && (
              <p className="text-destructive text-sm mt-2">
                Speech recognition not supported in this browser. Try Chrome.
              </p>
            )}
          </>
        )}

        {/* LISTENING SCREEN */}
        {phase === "listening" && (
          <>
            <MicButton
              isListening={true}
              onStart={handleStartListening}
              onStop={handleStopListening}
            />
            <TranscriptBox
              transcript={speech.transcript}
              isListening={speech.isListening}
            />
            {speech.transcript && (
              <button
                onClick={handleStopListening}
                className="px-8 py-3 rounded-xl bg-accent text-accent-foreground font-semibold
                  hover:opacity-90 transition-opacity shadow-md animate-fade-up"
              >
                Done Speaking
              </button>
            )}
          </>
        )}

        {/* PROCESSING SCREEN */}
        {phase === "processing" && <ProcessingView />}

        {/* RESULT SCREEN */}
        {phase === "result" && intentResult && (
          <>
            <ResultCard result={intentResult} />
            {intentResult.voiceResponse && (
              <div className="w-full max-w-md bg-accent/10 rounded-xl p-4 border border-accent/20 animate-fade-up">
                <p className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-lg">🔊</span>
                  <span className="italic">{intentResult.voiceResponse}</span>
                </p>
              </div>
            )}
            <ActionButtons
              onConfirm={handleConfirm}
              onEdit={handleReset}
              loading={submitting}
            />
          </>
        )}

        {/* SUCCESS SCREEN */}
        {phase === "success" && savedReport && (
          <SuccessView report={savedReport} onReset={handleReset} />
        )}
      </main>

      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground">
          NagrikAI — Civic Voice Assistant • Hackathon MVP
        </p>
      </footer>
    </div>
  );
};

export default Index;
