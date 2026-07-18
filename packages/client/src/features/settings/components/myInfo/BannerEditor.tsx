import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import BannerPickerModal from './BannerPickerModal';

interface BannerEditorProps {
  currentBannerUrl?: string;
}

const BannerEditor = ({ currentBannerUrl }: BannerEditorProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsPickerOpen(true)}
        className="group relative h-24 w-full overflow-hidden rounded-lg bg-surface-raised focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
        aria-label="Change banner"
      >
        {currentBannerUrl && (
          <img
            src={currentBannerUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
          <Camera className="h-6 w-6 text-white" strokeWidth={1.75} />
        </div>
      </motion.button>

      <BannerPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
      />
    </>
  );
};

export default BannerEditor;
