import { supabase } from "./supabaseClient";

export async function createClip({
  projectId,
  clipUrl,
  reason,
  startTime,
  endTime,
}: {
  projectId: string;
  clipUrl: string;
  reason?: string;
  startTime: number;
  endTime: number;
}) {
  const { data, error } = await supabase
    .from("clips")
    .insert({
      project_id: projectId,
      clip_url: clipUrl,
      reason: reason ?? null,
      start_time: startTime,
      end_time: endTime,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Fetch all clips for a specific project
export async function getProjectClips(projectId: string) {
  const { data, error } = await supabase
    .from("clips")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}
