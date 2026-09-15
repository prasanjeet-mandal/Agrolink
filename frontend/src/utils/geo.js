const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 5000,
};

async function reverseGeocodeBigDataCloud(latitude, longitude) {
  try {
    const url =
      `https://api.bigdatacloud.net/data/reverse-geocode-client` +
      `?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const d = await res.json();
    const locality = d.locality || d.city || '';
    return {
      line1: locality,
      city: d.city || d.locality || '',
      state: d.principalSubdivision || '',
      pincode: d.postcode || '',
    };
  } catch {
    return null;
  }
}

async function reverseGeocodeNominatim(latitude, longitude) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    });
    if (!res.ok) return null;
    const d = await res.json();
    const a = d.address || {};
    const road = a.road || a.pedestrian || a.footway || '';
    const suburb = a.suburb || a.neighbourhood || a.village_district || '';
    const house = a.house_number ? `${a.house_number} ${road}`.trim() : road;
    const line1 = [house || road, suburb].filter(Boolean).join(', ');
    return {
      line1: line1 || a.city || '',
      city: a.city || a.town || a.village || a.municipality || a.county || '',
      state: a.state || '',
      pincode: a.postcode || '',
    };
  } catch {
    return null;
  }
}

export async function detectLocation() {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser');
  }

  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, GEO_OPTIONS);
  });

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const [bdcResult, nomResult] = await Promise.allSettled([
    reverseGeocodeBigDataCloud(latitude, longitude),
    reverseGeocodeNominatim(latitude, longitude),
  ]);
  const bdc = valueOf(bdcResult);
  const nom = valueOf(nomResult);

  const line1 = (bdc?.line1 && bdc.line1 !== bdc?.city ? bdc.line1 : '') || nom?.line1 || '';
  const city = bdc?.city || nom?.city || '';
  const state = bdc?.state || nom?.state || '';
  const pincode = bdc?.pincode || nom?.pincode || '';

  const parts = [];
  if (line1 && line1 !== city) parts.push(line1);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (pincode) parts.push(pincode);

  return {
    latitude,
    longitude,
    accuracy: Math.round(position.coords.accuracy ?? 0),
    line1: line1 || '',
    city,
    state,
    pincode,
    locationText: parts.join(', '),
  };
}

function valueOf(result) {
  return result.status === 'fulfilled' ? result.value : null;
}

export function formatCoords(latitude, longitude) {
  return `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`;
}