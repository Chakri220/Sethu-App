import { createClient } from "@supabase/supabase-js";

// Your Sethu database connection.
// The publishable key is safe to use in browser code (Supabase confirms this),
// and Row Level Security protects your data.
const SUPABASE_URL = "https://mfyjzcwfckitndkdqigt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__AI6sIiL_9MY9f_RlL_KYQ_FkNjw4Ca";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
