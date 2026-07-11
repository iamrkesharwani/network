import { MOBILE_MAX } from '@network/shared';
import { useMainWidth } from './useMainWidth';

export const useIsMobileLayout = (): boolean => useMainWidth() <= MOBILE_MAX;
