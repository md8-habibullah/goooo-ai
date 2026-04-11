> ### ⚠️ INTELLECTUAL PROPERTY NOTICE & WARNING
> **Copyright © 2024-2026 [md8-habibullah](https://github.com/md8-habibullah) & Dreams of X. All Rights Reserved.**
> 
> This repository contains proprietary code, logic, and architectural designs for **NagrikAI**. 
> 
> **UNAUTHORIZED COPYING, REPRODUCTION, OR REDISTRIBUTION OF THIS SOURCE CODE, IN WHOLE OR IN PART, IS STRICTLY PROHIBITED.**  
> This project was developed as a competition MVP. Any attempt to clone, fork (for the purpose of theft), or use this logic for commercial or public use without explicit written permission will result in legal action and notification to the relevant hackathon authorities and platforms. 
> 
> **Be original. Do not copy.**

# NagrikAI 🇧🇩 — Bringing Every Voice to the Forefront

*A Hackathon MVP: Action-Based Voice AI Civic Assistant for Bangladesh*

---

### The Heartbeat of Our Rural Villages (Background & Purpose)

Deep in the rural heartlands of Bangladesh—from the haors of Sunamganj to the coastal belts of Bhola—technology often feels like a distant privilege. When a severe cyclone strikes, when a tube-well breaks leaving hundreds without safe drinking water, or when electricity is gone for days, the people experiencing the greatest hardships are often the ones with the least ability to navigate complex digital forms or bureaucratic hotlines. 

My grandfather, like millions of others in our villages, has never typed an email or filled out an English web form. But he knows his problems. He has a voice.

**The Purpose:** What if a simple tap and a spoken sentence in his native, rural dialect could instantly connect him right to the authorities? What if his distressed voice could bypass the barriers of literacy, technology, and language? 

**NagrikAI solves exactly this.** It is not a chatbot that wastes time with conversation. It is an **action-oriented civic bridge**. We turn spoken, emotional pleas into structured, high-priority data that institutions (Police, Hospitals, City Corporations) can act upon instantly. 

---

### What We Do

**NagrikAI** is a premium, action-driven Voice Assistant tailored specifically for the civic ecosystem in Bangladesh. 

**The Workflow:**
1. **Speak:** A user taps the microphone and speaks their problem naturally in Bangla or English. (e.g., *"আমাদের গ্রামে গত তিনদিন ধরে বিদ্যুৎ নেই এবং কলের পানি নষ্ট।"*)
2. **Understand:** Using advanced Voice-to-Text and Intelligence (via OpenRouter), the AI instantly listens, structures, and categorizes the emotional plea.
3. **Visualize:** The UI elegantly presents a confirmation card, showing exactly what action is being taken (e.g., "Filing Report to Local Municipality"). 
4. **Action:** Once confirmed, the system immediately routes the structured data (Priority: High, Category: Infrastructure, Location: Extracted from voice) into the civic database. 

---

### Technical Architecture

Designed over 6 hours as a sleek, robust Hackathon MVP. 

- **Frontend:** Next.js (App Router), Tailwind CSS
- **Voice System:** `MediaRecorder` API backed by AI audio transcription routes for flawless capture.
- **NLP Engine:** OpenRouter AI API processes raw text into structured JSON Intents.
- **Database:** Local SQLite3 dynamically storing Reports, Institutions, and Events.
- **UI/UX Strategy:** Minimalist, glass-like slate interface optimized for low-friction usability and high-contrast accessibility.

---

### Why It Matters

We are not just building software; we are building a lifeline. By converting a simple spoken sentence in Bengali into structured bureaucratic data, NagrikAI removes the burden of technology from the user. It empowers the voiceless, ensuring that the cry of a remote village is heard, processed, and acted upon just as swiftly as a complaint from the capital city. 

Every voice deserves to be heard. 

---
*Built with ❤️ for Bangladesh.*
