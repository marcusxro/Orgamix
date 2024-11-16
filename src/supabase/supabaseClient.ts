import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABSE_ANON_KEY;

const supabaseUrlTwo: string =  import.meta.env.VITE_SUPABASETWO_URL;
const supabaseAnonKeyTwo: string = import.meta.env.VITE_SUPABASETWO_KEY;


export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseTwo = createClient(supabaseUrlTwo, supabaseAnonKeyTwo)




