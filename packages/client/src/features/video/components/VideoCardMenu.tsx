import { useState } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

interface VideoCardMenuProps {
  onEdit: (e: React.MouseEvent) => void;
  onDeleteClick: (e: React.MouseEvent) => void;
}

const VideoCardMenu = ({ onEdit, onDeleteClick }: VideoCardMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const handleEdit = (e: React.MouseEvent) => {
    setMenuOpen(false);
    onEdit(e);
  };

  const handleDelete = (e: React.MouseEvent) => {
    setMenuOpen(false);
    onDeleteClick(e);
  };

  return (
    <div className="relative shrink-0 self-start">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Video options"
        aria-expanded={menuOpen}
        className={cn(
          'p-1.5 -mr-1 rounded-lg text-icon transition-all focus:outline-none',
          'opacity-0 group-hover:opacity-100 focus:opacity-100',
          menuOpen
            ? 'opacity-100 bg-surface-overlay text-icon-hover'
            : 'hover:bg-surface-raised hover:text-icon-hover'
        )}
      >
        <MoreVertical className="w-4 h-4" strokeWidth={1.75} />
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-8 z-20 w-40 py-1 rounded-xl bg-surface-overlay border border-border shadow-xl shadow-black/40">
            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-error hover:bg-error-subtle transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoCardMenu;
