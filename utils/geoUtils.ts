// src/utils/geoUtils.ts

export function saveCountryCode(code: string | null) {
  if (code) localStorage.setItem('user_country_code', code.toLowerCase());
}

export function getSavedCountryCode(): string | null {
  return localStorage.getItem('user_country_code');
}

export async function getCountryFromBrowserGeolocation(): Promise<string | null> {
  if (!navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          if (data && data.countryCode) {
            saveCountryCode(data.countryCode);
            resolve(data.countryCode.toLowerCase());
          } else {
            resolve(null);
          }
        } catch (error) {
          console.warn('Reverse geocoding error:', error);
          resolve(null);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        resolve(null);
      },
      { timeout: 10000 }
    );
  });
}

export async function fetchCountryFromIP(): Promise<string | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch IP location');
    const data = await response.json();

    if (data && data.country_code) {
      saveCountryCode(data.country_code);
      return data.country_code.toLowerCase();
    }
  } catch (err) {
    console.warn('IP location fetch error:', err);
  }
  return null;
}

export async function detectUserCountry(): Promise<string | null> {
  // Check if country already saved in localStorage
  const saved = getSavedCountryCode();
  if (saved) return saved;

  // Try browser geolocation
  const geoCountry = await getCountryFromBrowserGeolocation();
  if (geoCountry) return geoCountry;

  // Fallback to IP detection
  const ipCountry = await fetchCountryFromIP();
  if (ipCountry) return ipCountry;

  return null;
}
