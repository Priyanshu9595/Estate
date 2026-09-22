const configuredApiUrl = import.meta.env.VITE_API_URL;
const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_URL = configuredApiUrl || (isLocalhost ? 'http://localhost:5000' : window.location.origin);

if (!configuredApiUrl && !isLocalhost) {
  console.warn(
    'VITE_API_URL is not set. Falling back to same-origin API. Set VITE_API_URL to your Render backend URL if backend is deployed separately.'
  );
}

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Remove trailing slash from API_URL if exists
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  // Ensure path starts with slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
};
