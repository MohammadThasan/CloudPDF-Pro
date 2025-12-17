// Type definitions for Google API globals
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

// Helper to access environment variables safely
const getEnvVar = (key: string) => {
  let value = '';
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      value = import.meta.env[key];
    }
    // @ts-ignore
    else if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
      // @ts-ignore
      value = import.meta.env[`VITE_${key}`];
    }
    // @ts-ignore
    else if (typeof process !== 'undefined' && process.env && process.env[`REACT_APP_${key}`]) {
      // @ts-ignore
      value = process.env[`REACT_APP_${key}`];
    }
    // @ts-ignore
    else if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      value = process.env[key];
    }
  } catch (e) {
    // console.warn("Error reading env var", key);
  }
  return value;
};

// Accessors for Credentials (Env -> LocalStorage)
export const getGoogleCredentials = () => {
  // 1. Try Environment Variables
  let apiKey = getEnvVar('GOOGLE_API_KEY');
  let clientId = getEnvVar('GOOGLE_CLIENT_ID');
  
  // 2. Try LocalStorage (Fallback for runtime config)
  if (!apiKey) apiKey = localStorage.getItem('GOOGLE_API_KEY') || '';
  if (!clientId) clientId = localStorage.getItem('GOOGLE_CLIENT_ID') || '';
  
  return { apiKey, clientId };
};

export const setGoogleCredentials = (apiKey: string, clientId: string) => {
  localStorage.setItem('GOOGLE_API_KEY', apiKey);
  localStorage.setItem('GOOGLE_CLIENT_ID', clientId);
  
  // Reset Init State to allow re-initialization with new keys
  pickerInited = false;
  gisInited = false;
  tokenClient = null;
  accessToken = null;
};

export const isDriveConfigured = () => {
    const { apiKey, clientId } = getGoogleCredentials();
    return !!(apiKey && clientId);
};

// Scopes required for File Picker and saving files
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';

let tokenClient: any;
let accessToken: string | null = null;
let pickerInited = false;
let gisInited = false;

// Helper to wait for scripts to load
const waitForGoogleScripts = (): Promise<void> => {
    return new Promise((resolve) => {
        if (window.gapi && window.google && window.google.accounts) {
            resolve();
            return;
        }
        
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (window.gapi && window.google && window.google.accounts) {
                clearInterval(interval);
                resolve();
            }
            if (attempts > 50) { 
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
};

/**
 * Initializes the Google API client and Identity Services.
 */
export const initGoogleDrive = async () => {
  await waitForGoogleScripts();

  const { apiKey, clientId } = getGoogleCredentials();

  if (!apiKey || !clientId) {
    console.warn("Google Drive API Key or Client ID is missing.");
    return;
  }

  // Prevent double init
  if (pickerInited && gisInited && tokenClient) return;
  
  try {
    // 1. Load Picker API (gapi)
    const pickerLoaded = new Promise<void>((resolve) => {
        if (!window.gapi) {
            resolve();
            return;
        }
        window.gapi.load('picker', () => {
            pickerInited = true;
            resolve();
        });
    });

    // 2. Load GIS (Google Identity Services) for OAuth
    const gisLoaded = new Promise<void>((resolve) => {
        if (!window.google || !window.google.accounts) {
            resolve();
            return;
        }
        try {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: SCOPES,
                callback: (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        accessToken = tokenResponse.access_token;
                    }
                },
            });
            gisInited = true;
            resolve();
        } catch (e) {
            console.error("GIS Init Error", e);
            resolve();
        }
    });

    await Promise.all([pickerLoaded, gisLoaded]);
  } catch (e) {
      console.error("Failed to initialize Google Drive services", e);
      throw new Error("INIT_FAILED");
  }
};

/**
 * Helper to request a fresh token via OAuth Popup using GIS
 */
const requestToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            if (!tokenClient) {
                // If token client is missing, it might be due to missing keys or init failure
                reject(new Error("Token Client not ready. Check API configuration."));
                return;
            }
            
            tokenClient.callback = (resp: any) => {
                if (resp.error !== undefined) {
                    reject(resp);
                }
                accessToken = resp.access_token;
                resolve(accessToken!);
            };
            
            tokenClient.requestAccessToken({ prompt: '' }); 
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Opens the Google Drive Picker
 */
export const openDrivePicker = async (): Promise<File | null> => {
  const { apiKey, clientId } = getGoogleCredentials();
  
  if (!apiKey || !clientId) {
      throw new Error("MISSING_KEYS");
  }

  await initGoogleDrive();
  
  if (!pickerInited || !gisInited || !tokenClient) {
    await initGoogleDrive();
    if (!pickerInited || !gisInited || !tokenClient) {
       throw new Error("INIT_FAILED");
    }
  }
  
  try {
    if (!accessToken) {
        await requestToken();
    }

    const appId = clientId.split('-')[0];

    return new Promise((resolve, reject) => {
        if (!window.google || !window.google.picker) {
             reject(new Error("Google Picker API not loaded"));
             return;
        }

        const buildPicker = (token: string) => {
            const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
            view.setMimeTypes('application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation');
            
            const picker = new window.google.picker.PickerBuilder()
                .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
                .setDeveloperKey(apiKey)
                .setAppId(appId) 
                .setOAuthToken(token)
                .addView(view)
                .addView(new window.google.picker.DocsUploadView())
                .setCallback(async (data: any) => {
                    if (data.action === window.google.picker.Action.PICKED) {
                        const doc = data.docs[0];
                        const fileId = doc.id;
                        const mimeType = doc.mimeType;
                        const name = doc.name;

                        try {
                            let response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                                headers: { 'Authorization': `Bearer ${accessToken}` }
                            });

                            if (response.status === 401) {
                                const newToken = await requestToken();
                                response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                                    headers: { 'Authorization': `Bearer ${newToken}` }
                                });
                            }

                            if (!response.ok) throw new Error("Failed to fetch file content");
                            
                            const blob = await response.blob();
                            const file = new File([blob], name, { type: mimeType });
                            resolve(file);
                        } catch (error) {
                            console.error("Error downloading file from Drive", error);
                            reject(error);
                        }
                    } else if (data.action === window.google.picker.Action.CANCEL) {
                        resolve(null);
                    }
                })
                .build();
            picker.setVisible(true);
        }
        
        buildPicker(accessToken!);
    });
  } catch (error) {
      if ((error as any).message !== "MISSING_KEYS") {
        console.error("Drive Picker Error", error);
      }
      throw error;
  }
};

/**
 * Uploads a file to Google Drive.
 */
export const saveToDrive = async (blob: Blob, fileName: string): Promise<string> => {
  const { apiKey, clientId } = getGoogleCredentials();
  
  if (!apiKey || !clientId) {
      throw new Error("MISSING_KEYS");
  }

  await initGoogleDrive();

  if (!pickerInited || !gisInited || !tokenClient) {
      throw new Error("INIT_FAILED");
  }

  if (!accessToken) {
     await requestToken();
  }

  const metadata = {
    name: fileName,
    mimeType: blob.type,
  };

  const uploadFile = async (token: string) => {
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });
      return response;
  }

  let response = await uploadFile(accessToken!);

  if (response.status === 401) {
      const newToken = await requestToken();
      response = await uploadFile(newToken);
  }

  if (!response.ok) {
    throw new Error(`Drive Upload Failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
};