import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://mfyzppxcuduusuzkbumr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meXpwcHhjdWR1dXN1emtidW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNzQ1OTUsImV4cCI6MjA5ODk1MDU5NX0.f8qImxw_a21sMkgZMlaaNMYseIyrBdXp6-a3eIclwvw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
