import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import type { IPlaylistItemResponse, ViewMode } from '@network/shared';
import PlaylistItemTile from './PlaylistItemTile';
import PlaylistItemListRow from './PlaylistItemListRow';

export interface PlaylistItemsSortableProps {
  items: IPlaylistItemResponse[];
  isOwner: boolean;
  viewMode: ViewMode;
  onReorder: (itemId: string, toIndex: number) => void;
  onRemove?: (item: IPlaylistItemResponse) => void;
}

const GRID_CLASSES =
  'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6';
const LIST_CLASSES = 'flex flex-col gap-2';

const PlaylistItemsSortable = ({
  items,
  isOwner,
  viewMode,
  onReorder,
  onRemove,
}: PlaylistItemsSortableProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedItems = [...items].sort((a, b) => a.position - b.position);
  const isGrid = viewMode === 'grid';
  const containerClass = isGrid ? GRID_CLASSES : LIST_CLASSES;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const toIndex = sortedItems.findIndex((item) => item.id === over.id);
    if (toIndex === -1) return;

    onReorder(String(active.id), toIndex);
  };

  const renderItem = (item: IPlaylistItemResponse, index: number) =>
    isGrid ? (
      <PlaylistItemTile
        key={item.id}
        item={item}
        isOwner={isOwner}
        onRemove={isOwner ? onRemove : undefined}
      />
    ) : (
      <PlaylistItemListRow
        key={item.id}
        item={item}
        index={index}
        isOwner={isOwner}
        onRemove={isOwner ? onRemove : undefined}
      />
    );

  if (!isOwner) {
    return (
      <div className={containerClass}>
        <AnimatePresence initial={false}>
          {sortedItems.map((item, index) => renderItem(item, index))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedItems.map((item) => item.id)}
        strategy={isGrid ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div className={containerClass}>
          {sortedItems.map((item, index) => renderItem(item, index))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default PlaylistItemsSortable;
