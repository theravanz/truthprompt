import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqjkrosuoosnzmrexgyx.supabase.co';
const supabaseAnonKey = 'sb_publishable_h8ziTUR5sp0SMfm1pEYt-Q_3IVfYfe8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
