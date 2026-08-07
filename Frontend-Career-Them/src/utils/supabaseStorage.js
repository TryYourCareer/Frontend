import { supabase, isSupabaseConfigured } from "../supabaseConfig";

export async function saveDocument(collectionName, docId, data) {
  if (!isSupabaseConfigured) {
    return null;
  }

  // Supabase upsert (insert or update)
  const { error } = await supabase
    .from(collectionName)
    .upsert({ id: docId, ...data, updated_at: new Date().toISOString() });
    
  if (error) {
    console.error("Error saving document to Supabase:", error);
    return null;
  }
  return docId;
}

export async function addDocument(collectionName, data) {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data: insertedData, error } = await supabase
    .from(collectionName)
    .insert([{ ...data, created_at: new Date().toISOString() }])
    .select();
    
  if (error) {
    console.error("Error adding document to Supabase:", error);
    return null;
  }
  return insertedData?.[0]?.id || null;
}

export async function getDocuments(collectionName, maxResults = 100) {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from(collectionName)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(maxResults);
      
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function getDocument(collectionName, docId) {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from(collectionName)
      .select("*")
      .eq("id", docId)
      .single();
      
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export const isFirebaseReady = isSupabaseConfigured; // alias for backwards compatibility
