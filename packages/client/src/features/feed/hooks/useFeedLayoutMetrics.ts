import { MOBILE_MAX, TABLET_MAX } from '@network/shared';
import { useMainWidth } from '../../../shared/hooks/useMainWidth';
import type { ColCount } from '../../video/utils/videoGrid';

export const getLeadVideoRowCols = (width: number): ColCount =>
  width >= MOBILE_MAX ? 2 : 1;

export const getShortsTeaserCount = (width: number): ColCount => {
  if (width >= TABLET_MAX) return 4;
  if (width >= MOBILE_MAX) return 3;
  return 2;
};

export const getShowChatRail = (width: number): boolean => width >= TABLET_MAX;

export interface FeedLayoutMetrics {
  leadVideoRowCols: ColCount;
  shortsTeaserCount: ColCount;
  showChatRail: boolean;
}

export const useFeedLayoutMetrics = (): FeedLayoutMetrics => {
  const width = useMainWidth();

  return {
    leadVideoRowCols: getLeadVideoRowCols(width),
    shortsTeaserCount: getShortsTeaserCount(width),
    showChatRail: getShowChatRail(width),
  };
};
