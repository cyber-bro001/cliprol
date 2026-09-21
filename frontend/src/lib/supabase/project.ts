import { supabase } from "./supabaseClient";

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
export async function getUserProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

//FETCH PROJECT BY ID
export async function getProject(projectId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

//UPDATE PROJECT STATUS
export async function updateProject(
  projectId: string,
  updates: {
    title?: string;
    status?: "processing" | "done" | "error";
    inputUrl?: string;
  },
) {
  const { data, error } = await supabase
    .from("projects")
    .update({
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.inputUrl !== undefined && { input_url: updates.inputUrl }),
    })
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

//