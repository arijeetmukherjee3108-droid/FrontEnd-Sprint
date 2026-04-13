// Art Institute of Chicago API Service
const ART_API_BASE = 'https://api.artic.edu/api/v1';
const IIIF_BASE = 'https://www.artic.edu/iiif/2';

/**
 * Get the image URL for an artwork
 */
export function getImageUrl(imageId, size = 843) {
  if (!imageId) return null;
  return `${IIIF_BASE}/${imageId}/full/${size},/0/default.jpg`;
}

/**
 * Fetch a curated set of artworks with images
 * We search for well-known artwork types to ensure good images
 */
export async function fetchArtworks(page = 1, limit = 12) {
  const fields = [
    'id', 'title', 'artist_display', 'date_display',
    'medium_display', 'dimensions', 'image_id', 'thumbnail',
    'department_title', 'artwork_type_title', 'style_title',
    'classification_title', 'subject_titles', 'description'
  ].join(',');

  const response = await fetch(
    `${ART_API_BASE}/artworks/search?q=painting&limit=${limit}&page=${page}&fields=${fields}&query[term][is_public_domain]=true`
  );

  if (!response.ok) {
    throw new Error(`Art API error: ${response.status}`);
  }

  const json = await response.json();
  
  // Filter out artworks without images
  const artworks = json.data.filter(art => art.image_id);
  
  return {
    artworks,
    pagination: json.pagination,
  };
}

/**
 * Fetch a single artwork by ID
 */
export async function fetchArtworkById(id) {
  const fields = [
    'id', 'title', 'artist_display', 'date_display',
    'medium_display', 'dimensions', 'image_id', 'thumbnail',
    'department_title', 'artwork_type_title', 'style_title',
    'classification_title', 'subject_titles', 'description',
    'place_of_origin', 'credit_line'
  ].join(',');

  const response = await fetch(`${ART_API_BASE}/artworks/${id}?fields=${fields}`);
  
  if (!response.ok) {
    throw new Error(`Art API error: ${response.status}`);
  }

  const json = await response.json();
  return json.data;
}

/**
 * Search artworks by query
 */
export async function searchArtworks(query, limit = 12) {
  const fields = [
    'id', 'title', 'artist_display', 'date_display',
    'medium_display', 'dimensions', 'image_id', 'thumbnail',
    'department_title', 'artwork_type_title', 'style_title',
    'classification_title', 'subject_titles', 'description'
  ].join(',');

  const response = await fetch(
    `${ART_API_BASE}/artworks/search?q=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}&query[term][is_public_domain]=true`
  );

  if (!response.ok) {
    throw new Error(`Art API error: ${response.status}`);
  }

  const json = await response.json();
  const artworks = json.data.filter(art => art.image_id);
  
  return { artworks, pagination: json.pagination };
}
