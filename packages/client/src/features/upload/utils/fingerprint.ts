export const computeFileFingerprint = (file: File): string => {
  return `${file.name}:${file.size}:${file.lastModified}`;
};
