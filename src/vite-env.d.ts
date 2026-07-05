/// <reference types="vite/client" />

interface GoogleOAuth2TokenClient {
  requestAccessToken: () => void;
}

interface GoogleOAuth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: { access_token?: string; error?: string }) => void;
    error_callback?: () => void;
  }) => GoogleOAuth2TokenClient;
}

interface GoogleAccounts {
  oauth2: GoogleOAuth2;
}

interface Window {
  google?: {
    accounts?: GoogleAccounts;
  };
}
