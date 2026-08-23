# Spec: AI Tutor UTBK

## Overview
Transform the existing rigid roleplay-based OSCE architecture into a free-form, RAG (Retrieval-Augmented Generation) based "AI Tutor UTBK". The tutor will answer any questions asked by the user, prioritize answering based on uploaded materials (questions, answers, discussions, flashcards), and fallback to Google Search Grounding to avoid hallucinations when the answer is not in the local knowledge base.

## Core Features
1. **RAG-based Knowledge Integration**:
   - Ability for admins to upload text/markdown materials (soal, pembahasan, materi UTBK).
   - The AI uses these documents as the primary context for answering user queries.
2. **Google Search Grounding**:
   - If the local knowledge base doesn't have the answer, the AI can search the web to provide accurate, up-to-date information.
3. **Interactive Tutor Room**:
   - A clean UI where users can chat via voice (Gemini Live) or text with the AI Tutor.
   - Removal of OSCE-specific concepts (Rubrics, Mentors, Strict grading, Actor instructions).
4. **Flexible System Prompt**:
   - The AI acts as a smart, Socratic tutor for UTBK subjects (TPS, Literasi). It guides students instead of spoon-feeding answers.

## Architecture Changes
- **Database**:
  - Remove rubrics and mentor-related tables if they exist in the tutor domain.
  - Create tables for tutor_materials (to store text/markdown for RAG).
- **Backend / Integration**:
  - Modify the Gemini Live integration to accept document contexts.
  - Enable Google Search tool in the Gemini API call.
- **Frontend**:
  - Replace SessionBuilderForm with MaterialUploaderForm.
  - Simplify LiveCallWidget to just be a TutorRoomWidget.

## Global Constraints
- Must use existing Gemini Live WebRTC setup for voice.
- Database is Supabase.
- Framework is React + Vite + Tailwind.
- TypeScript strictly typed.
