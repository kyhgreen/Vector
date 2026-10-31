/*
  Stand-in for 'virtual:pwa-register' in the single-file build (npm run build:file).
  A file opened straight from the computer can't register a service worker,
  and doesn't need one: everything is already inside the file.
*/
export function registerSW(_options?: unknown): (reloadPage?: boolean) => Promise<void> {
  return async () => {}
}
