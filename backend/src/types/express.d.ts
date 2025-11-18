// ===================================================================
// TIPOS CUSTOMIZADOS PARA EXPRESS - BACKEND ECOFIELD SYSTEM
// Localização: backend/src/types/express.d.ts
// ===================================================================

import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {}; 