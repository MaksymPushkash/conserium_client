export interface NotionConnection {
  connected: boolean;
  workspace_id: string | null;
  workspace_name: string | null;
  bot_id: string | null;
  default_parent_page_id: string | null;
  default_parent_page_title: string | null;
}

export interface NotionPage {
  id: string;
  title: string;
}

export interface IntegrationConnectUrlResponse {
  url: string;
}

export interface NotionImportResponse {
  intake_item: {
    id: string;
    provider: string;
    title: string;
    status: string;
    document_id: string | null;
  };
  document: {
    id: string;
    title: string;
    status: string;
  } | null;
}


export interface TelegramChatBinding {
  id: string;
  chat_id: string;
  chat_username: string | null;
  chat_title: string | null;
  paired_at: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface TelegramStatus {
  bindings: TelegramChatBinding[];
}

export interface TelegramPairingCode {
  id: string;
  code: string;
  expires_at: string;
}
