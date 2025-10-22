// src/api.js
// TheDogAPI client: fetchRandomDog
//
// Exports: fetchRandomDog(options)
// See TASKS.md for data contract

const THE_DOG_API_BASE = 'https://api.thedogapi.com/v1/images/search';

// helper: timeout fetch using AbortController
async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Normalize a TheDogAPI image object to our shape or return null if no usable breed.
function normalizeImageObj(imgObj) {
  if (!imgObj) return null;
  const id = imgObj.id || (imgObj.breeds && imgObj.breeds[0] && imgObj.breeds[0].id) || null;
  const imageUrl = imgObj.url || null;
  const breedObj = Array.isArray(imgObj.breeds) && imgObj.breeds.length > 0 ? imgObj.breeds[0] : null;

  if (!breedObj) return null; // require a breed for our normalized contract

  const attributes = {
    breed: breedObj.name || '',
    temperament: breedObj.temperament || '',
    life_span: breedObj.life_span || '',
    weight: (breedObj.weight && (breedObj.weight.imperial || breedObj.weight.metric)) || ''
  };

  return { id, imageUrl, attributes };
}

// check if normalized item matches ban list
// banList keys expected to be attribute names; temperament is tokenized by comma.
function isBanned(item, banList = {}) {
  if (!item || !item.attributes) return true; // treat malformed as banned/skip

  const attrs = item.attributes;

  // Helper: exact compare, case-insensitive
  const eq = (a, b) => {
    if (a == null || b == null) return false;
    return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
  };

  // Breed, life_span, weight: exact match against banList arrays (case-insensitive)
  for (const key of ['breed', 'life_span', 'weight']) {
    const bannedVals = banList[key];
    if (Array.isArray(bannedVals) && bannedVals.length) {
      for (const b of bannedVals) {
        if (eq(attrs[key], b)) return true;
      }
    }
  }

  // Temperament: split tokens by comma and compare tokens to banned entries
  if (Array.isArray(banList.temperament) && banList.temperament.length) {
    const temperament = attrs.temperament || '';
    const tokens = temperament.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    for (const banned of banList.temperament) {
      const b = String(banned).trim().toLowerCase();
      if (tokens.includes(b)) return true;
    }
  }

  return false;
}

/**
 * Fetch a single random dog image from TheDogAPI that does not match the ban list.
 * @param {Object} options
 * @param {Object} options.banList - { breed: [], temperament: [], life_span: [], weight: [] }
 * @param {number} options.maxAttempts - how many API attempts to try before failing (default 8)
 * @param {number} options.timeout - fetch timeout in ms (default 8000)
 * @returns {Promise<{id:string,imageUrl:string,attributes:Object}>}
 */
export async function fetchRandomDog({ banList = {}, maxAttempts = 8, timeout = 8000 } = {}) {
  if (typeof fetch === 'undefined') {
    throw new Error('fetch is not available in this environment');
  }

  const apiKey = import.meta.env.VITE_APP_ACCESS_KEY || '';
  const headers = apiKey ? { 'x-api-key': apiKey } : {};
  const url = `${THE_DOG_API_BASE}?limit=1&size=med&has_breeds=1&mime_types=jpg,png`;

  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const res = await fetchWithTimeout(url, { headers }, timeout);
      if (!res.ok) {
        throw new Error(`TheDogAPI error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      const imgObj = Array.isArray(data) && data.length ? data[0] : null;
      const normalized = normalizeImageObj(imgObj);

      // If normalization failed (no breed), skip and retry
      if (!normalized) continue;

      // If item is banned, retry
      if (isBanned(normalized, banList)) {
        // short delay before retry to avoid hammering the API
        await new Promise(r => setTimeout(r, 300));
        continue;
      }

      // Success
      return normalized;
    } catch (err) {
      if (attempt >= maxAttempts) {
        throw err;
      }
      // small backoff
      await new Promise(r => setTimeout(r, 300));
      continue;
    }
  }

  throw new Error('No non-banned result found after maximum attempts');
}

export default { fetchRandomDog };
