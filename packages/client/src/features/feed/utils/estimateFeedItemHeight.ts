import {
  FEED_CARD_HEADER_HEIGHT_PX,
  FEED_CARD_FOOTER_PADDING_PX,
  FEED_CARD_TITLE_TWO_LINE_HEIGHT_PX,
  FEED_CARD_META_LINE_HEIGHT_PX,
  FEED_CARD_GAP_PX,
  FEED_CARD_TEXT_LINE_HEIGHT_PX,
  FEED_CARD_TEXT_AVG_CHAR_WIDTH_PX,
  POST_TEXT_LINE_CLAMP,
  POST_TEXT_ONLY_MIN_HEIGHT_PX,
  type IFeedItem,
} from '@network/shared';

const mediaHeightFor16by9 = (columnWidthPx: number): number =>
  (columnWidthPx * 9) / 16;

const estimateTextBlockHeight = (
  textLength: number,
  columnWidthPx: number
): number => {
  if (textLength === 0) return 0;
  const charsPerLine = Math.max(
    20,
    columnWidthPx / FEED_CARD_TEXT_AVG_CHAR_WIDTH_PX
  );
  const lines = Math.min(
    POST_TEXT_LINE_CLAMP,
    Math.ceil(textLength / charsPerLine)
  );
  return lines * FEED_CARD_TEXT_LINE_HEIGHT_PX + FEED_CARD_GAP_PX;
};

export const estimateVideoCardHeight = (columnWidthPx: number): number =>
  FEED_CARD_HEADER_HEIGHT_PX +
  mediaHeightFor16by9(columnWidthPx) +
  FEED_CARD_TITLE_TWO_LINE_HEIGHT_PX +
  FEED_CARD_GAP_PX +
  FEED_CARD_META_LINE_HEIGHT_PX +
  FEED_CARD_FOOTER_PADDING_PX;

export const estimatePostCardHeight = (
  mediaType: 'none' | 'image' | 'video',
  textLength: number,
  columnWidthPx: number
): number => {
  const textHeight = estimateTextBlockHeight(textLength, columnWidthPx);
  const metaHeight = FEED_CARD_META_LINE_HEIGHT_PX + FEED_CARD_GAP_PX;

  if (mediaType === 'none') {
    return Math.max(
      FEED_CARD_HEADER_HEIGHT_PX +
        textHeight +
        metaHeight +
        FEED_CARD_FOOTER_PADDING_PX,
      POST_TEXT_ONLY_MIN_HEIGHT_PX
    );
  }

  return (
    FEED_CARD_HEADER_HEIGHT_PX +
    mediaHeightFor16by9(columnWidthPx) +
    textHeight +
    metaHeight +
    FEED_CARD_FOOTER_PADDING_PX
  );
};

export const estimateFeedItemHeight = (
  item: IFeedItem,
  columnWidthPx: number
): number => {
  if (item.type === 'video') {
    return estimateVideoCardHeight(columnWidthPx);
  }
  return estimatePostCardHeight(
    item.item.mediaType,
    (item.item.text ?? '').length,
    columnWidthPx
  );
};
