import {
  CHAT_RAIL_WIDTH_PX,
  FEED_CHAT_RAIL_GAP_PX,
  FEED_CONTENT_HORIZONTAL_PADDING_PX,
  FEED_GRID_GAP_PX,
} from '@network/shared';
import type { FeedColumnCount } from '../hooks/useFeedColumns';

export const computeColumnWidthPx = (
  mainWidthPx: number,
  columns: FeedColumnCount,
  showChatRail: boolean
): number => {
  const chatRailReservedPx = showChatRail
    ? CHAT_RAIL_WIDTH_PX + FEED_CHAT_RAIL_GAP_PX
    : 0;
  const contentWidthPx =
    mainWidthPx - FEED_CONTENT_HORIZONTAL_PADDING_PX * 2 - chatRailReservedPx;

  return Math.max(
    1,
    (contentWidthPx - (columns - 1) * FEED_GRID_GAP_PX) / columns
  );
};
