import { supabase } from "@/integrations/supabase/client";

export interface IntentResult {
  intent: string;
  category: string;
  priority: "high" | "medium" | "low";
  location: string;
  summary: string;
  confidence: number;
  actionLabel: string;
  voiceResponse?: string;
}

export async function processIntent(
  text: string,
  position?: { latitude: number; longitude: number } | null
): Promise<IntentResult> {
  const { data, error } = await supabase.functions.invoke("process-intent", {
    body: {
      text,
      latitude: position?.latitude,
      longitude: position?.longitude,
    },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(error.message || "Failed to process intent");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as IntentResult;
}

// Simulated report submission
export interface SavedReport {
  id: string;
  intent: string;
  category: string;
  priority: string;
  location: string;
  summary: string;
  status: string;
  timestamp: string;
  submittedTo: string;
}

const SUBMIT_TARGETS: Record<string, string> = {
  file_police_report: "Bangladesh Police – Local Thana",
  medical_assistance: "DGHS Emergency Services",
  civic_complaint: "Dhaka City Corporation",
  information_query: "National Information Portal",
  emergency_report: "National Disaster Response Center",
};

export function saveReport(result: IntentResult): Promise<SavedReport> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "RPT-" + Date.now().toString(36).toUpperCase(),
        intent: result.intent,
        category: result.category,
        priority: result.priority,
        location: result.location,
        summary: result.summary,
        status: "submitted",
        timestamp: new Date().toISOString(),
        submittedTo: SUBMIT_TARGETS[result.intent] || "Government Portal",
      });
    }, 1500);
  });
}
