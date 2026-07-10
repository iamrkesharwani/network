export type WizardStep = 'drop' | 'thumbnail' | 'details' | 'launch';

export const UploadSteps: { key: WizardStep; label: string }[] = [
  { key: 'drop', label: 'Upload' },
  { key: 'thumbnail', label: 'Thumbnail' },
  { key: 'details', label: 'Details' },
  { key: 'launch', label: 'Launch' },
];

// Post has no thumbnail concept server-side, so its finalize flow skips
// straight from the upload to the details/launch steps.
export const PostUploadSteps: { key: WizardStep; label: string }[] = [
  { key: 'drop', label: 'Upload' },
  { key: 'details', label: 'Details' },
  { key: 'launch', label: 'Launch' },
];
