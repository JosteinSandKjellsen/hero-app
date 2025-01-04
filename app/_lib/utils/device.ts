export function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );
}
