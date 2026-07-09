export type WizardStep = 'drop' | 'thumbnail' | 'details' | 'launch';

export const UploadSteps: { key: WizardStep; label: string }[] = [
  { key: 'drop', label: 'Upload' },
  { key: 'thumbnail', label: 'Thumbnail' },
  { key: 'details', label: 'Details' },
  { key: 'launch', label: 'Launch' },
];
