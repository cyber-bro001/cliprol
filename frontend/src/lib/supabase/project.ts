import { supabase } from "./supabaseClient";
import type { Project } from "../../types";

const PROJECT_FIELDS = "id,user_id,title,input_type,input_url,status,created_at,thumbnail_path";

export async function createProject({
  title,
  inputType,
  inputUrl,
}: {
  title: string;
  inputType: "url" | "upload";
  inputUrl?: string;
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title,
      input_type: inputType,
      input_url: inputUrl ?? null,
      status: "processing",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
// Fetch all projects for the authenticated user
// The user filter scopes the query; deployed RLS must enforce ownership independently.
export async function getUserProjects(userId: string, signal?: AbortSignal): Promise<Project[]> {
  if (!userId) throw new Error("User is not authenticated");
  let query = supabase
    .from("projects")
    .select(`${PROJECT_FIELDS},clips(count)`)
    .eq("user_id", userId)
    .eq("status", "done")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map(({ clips, ...project }) => ({ ...project, clip_count: clips[0]?.count ?? 0 }));
}

//FETCH PROJECT BY ID
export async function getProject(projectId: string, userId: string, signal?: AbortSignal): Promise<Project | null> {
  if (!userId) throw new Error("User is not authenticated");
  // Invalid IDs are unavailable projects, not a database/network failure.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) return null;
  let query = supabase
    .from("projects")
    .select(PROJECT_FIELDS)
    .eq("id", projectId)
    .eq("user_id", userId);
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
