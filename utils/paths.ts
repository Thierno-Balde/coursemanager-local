export function getResourcesDir(): string | null {
  if (typeof window !== 'undefined' && window.electronAPI?.getResourcesDir) {
    return window.electronAPI.getResourcesDir();
  }
  return null;
}
