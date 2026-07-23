import { findOne } from './db.js';

export function slugify(text) {
  return (
    text
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'shop'
  );
}

// Appends -2, -3 etc. if the slug is already taken
export function uniqueSlug(shopName) {
  const base = slugify(shopName);
  let candidate = base;
  let counter = 2;
  while (findOne('shops', (s) => s.slug === candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}