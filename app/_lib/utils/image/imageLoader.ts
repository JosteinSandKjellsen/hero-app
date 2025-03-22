import { ImageLoaderProps } from "next/image";

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // If the src is already a proxied URL, return it as-is
  if (src.startsWith('/api/')) {
    return src;
  }

  // If this is a Leonardo.ai image URL, extract the ID and use our proxy
  if (src.includes('cdn.leonardo.ai')) {
    // Extract the generation ID from the URL
    const matches = src.match(/generations\/([^/]+)/);
    if (matches && matches[1]) {
      return `/api/hero-image/${matches[1]}`;
    }
  }

  // For other images (like Bouvet cloud), use the original URL
  const params = new URLSearchParams();
  if (width) {
    params.append('w', width.toString());
  }
  if (quality) {
    params.append('q', quality.toString());
  }

  const queryString = params.toString();
  return `${src}${queryString ? `?${queryString}` : ''}`;
}
