declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        appleOAuth?: {
          postMessage: (message: any) => void;
        };
      };
    };
  }
}

export {};