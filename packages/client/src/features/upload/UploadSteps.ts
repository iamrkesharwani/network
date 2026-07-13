export type WizardStep =
  | 'drop'
  | 'thumbnail'
  | 'details-1'
  | 'details-2'
  | 'details-3'
  | 'confirmation';

export const VideoUploadSteps: { key: WizardStep; label: string }[] = [
  { key: 'drop', label: 'Upload' },
  { key: 'thumbnail', label: 'Thumbnail' },
  { key: 'details-1', label: 'Basics' },
  { key: 'details-2', label: 'Tags' },
  { key: 'details-3', label: 'Visibility' },
  { key: 'confirmation', label: 'Done' },
];

export const ShortUploadSteps: { key: WizardStep; label: string }[] = [
  { key: 'drop', label: 'Upload' },
  { key: 'thumbnail', label: 'Thumbnail' },
  { key: 'details-1', label: 'Basics' },
  { key: 'details-2', label: 'Tags & Visibility' },
  { key: 'confirmation', label: 'Done' },
];
