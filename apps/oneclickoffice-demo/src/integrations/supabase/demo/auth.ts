/* eslint-disable @typescript-eslint/no-explicit-any */
// Fake-Auth für den Demo-Modus: sofort und dauerhaft „eingeloggt" als Demo-Coach.
// AuthContext ruft getSession() + onAuthStateChange() → beide liefern die Demo-Session,
// wodurch ProtectedRoute den Nutzer durchlässt (kein Login-Screen).

import { DEMO_SESSION, DEMO_USER } from "./constants";

type AuthCallback = (event: string, session: any) => void;

export const demoAuth = {
  async getSession() {
    return { data: { session: DEMO_SESSION }, error: null };
  },

  async getUser() {
    return { data: { user: DEMO_USER }, error: null };
  },

  onAuthStateChange(callback: AuthCallback) {
    // Asynchron feuern (nicht während des Renders), analog zu supabase-js.
    Promise.resolve().then(() => callback("SIGNED_IN", DEMO_SESSION));
    return {
      data: {
        subscription: {
          id: "demo-subscription",
          callback,
          unsubscribe() {
            /* no-op */
          },
        },
      },
    };
  },

  async signInWithPassword() {
    return { data: { user: DEMO_USER, session: DEMO_SESSION }, error: null };
  },

  async signUp() {
    return { data: { user: DEMO_USER, session: DEMO_SESSION }, error: null };
  },

  async signOut() {
    return { error: null };
  },

  async resetPasswordForEmail() {
    return { data: {}, error: null };
  },

  async updateUser() {
    return { data: { user: DEMO_USER }, error: null };
  },
};
