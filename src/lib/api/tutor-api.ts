import { getSupabaseBrowserClient } from "../supabase/browser-client";

/** Typed transcript entry from TUTOR simulation */
export interface TutorTranscriptEntry {
  role: string;
  text: string;
  timestamp?: string;
}

/** Typed rubric result from AI evaluation */
export interface TutorRubricResult {
  competency: string;
  score: number;
  reasoning: string;
}

export async function saveTutorAttempt(payload: {
  stationId: string;
  totalScore: number;
  maxScore: number;
  transcript: TutorTranscriptEntry[];
  formData: string;
  rubricResults: TutorRubricResult[];
  feedback: string;
}) {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase.from('tutor_attempts').insert({
    station_id: payload.stationId,
    user_id: user.id,
    total_score: payload.totalScore,
    max_score: payload.maxScore,
    transcript: payload.transcript,
    form_data: payload.formData,
    rubric_results: payload.rubricResults,
    feedback: payload.feedback
  }).select('*').single();

  if (error) throw error;
  return data;
}

export async function deleteTutorStation(stationId: string) {
  const supabase = getSupabaseBrowserClient();
  
  const { error } = await supabase.from('tutor_stations')
    .delete()
    .eq('id', stationId);

  if (error) throw error;
  return true;
}

export async function listTutorStations() {
  const supabase = getSupabaseBrowserClient();
  
  const { data, error } = await supabase.from('tutor_stations')
    .select('id, title, type, duration_minutes, objective')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTutorAttemptDetail(attemptId: string) {
  const supabase = getSupabaseBrowserClient();
  
  const { data, error } = await supabase.from('tutor_attempts')
    .select(`
      *,
      station:tutor_stations (*)
    `)
    .eq('id', attemptId)
    .single();

  if (error) throw error;
  return data;
}

export async function listTutorAttemptHistory() {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase.from('tutor_attempts')
    .select(`
      id,
      created_at,
      total_score,
      max_score,
      station:tutor_stations ( title )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
