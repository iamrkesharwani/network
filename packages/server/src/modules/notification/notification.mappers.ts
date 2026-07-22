import type { INotificationListItem, INotificationActorSummary } from '@network/shared';
import type { INotificationDocument } from './notification.model.js';

interface PopulatedActor {
  _id: { toString(): string };
  username: string;
  name: string;
  avatarUrl?: string;
}

const toActorSummary = (actor: PopulatedActor): INotificationActorSummary => ({
  id: actor._id.toString(),
  username: actor.username,
  name: actor.name,
  ...(actor.avatarUrl && { avatarUrl: actor.avatarUrl }),
});

export const toListItem = (
  doc: INotificationDocument
): INotificationListItem => {
  const actors = (doc.actorIds as unknown as PopulatedActor[])
    .filter((actor) => actor && actor.username)
    .map(toActorSummary);

  return {
    id: doc._id.toString(),
    type: doc.type,
    category: doc.category,
    actors,
    actorCount: doc.actorCount,
    targetType: doc.targetType,
    ...(doc.targetId && { targetId: doc.targetId }),
    isRead: doc.isRead,
    createdAt: doc.createdAt.toISOString(),
  };
};
