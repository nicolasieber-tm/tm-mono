/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LISTMONK_URL: string;
  readonly VITE_LISTMONK_EARLY_ACCESS_LIST_ID: string;
  readonly VITE_LISTMONK_API_USER: string;
  readonly VITE_LISTMONK_API_TOKEN: string;
  readonly VITE_TELEGRAM_BOT_TOKEN?: string;
  readonly VITE_TELEGRAM_CHAT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
