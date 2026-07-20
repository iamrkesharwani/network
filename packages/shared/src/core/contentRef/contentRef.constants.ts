export const CONTENT_TYPES = ['video', 'short', 'post'] as const;
export const ENGAGEABLE_CONTENT_TYPES = [...CONTENT_TYPES, 'comment'] as const;

export const ENGAGEMENT_COUNT_SOCKET_EVENT = 'engagement:count';
export const CONTENT_ROOM_JOIN_EVENT = 'content:join';
export const CONTENT_ROOM_LEAVE_EVENT = 'content:leave';
