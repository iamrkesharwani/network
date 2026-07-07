import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../../shared/components/Avatar';
import PostCardMenu from './PostCardMenu';
import { getRelativeDate, type IPostResponse } from '@network/shared';

interface PostCardMetaProps {
  post: IPostResponse;
  isOwner: boolean;
  onEdit: (e: React.MouseEvent) => void;
  onDeleteClick: (e: React.MouseEvent) => void;
}

const PostCardMeta = ({
  post,
  isOwner,
  onEdit,
  onDeleteClick,
}: PostCardMetaProps) => {
  return (
    <div className="flex items-start gap-3">
      <Link
        to={`/profile/${post.author.username}`}
        className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <Avatar
          src={post.author.avatarUrl}
          alt={post.author.username}
          size="sm"
          fallback={post.author.username}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${post.author.username}`}
          className="text-sm font-semibold text-text-primary hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          onClick={(e) => e.stopPropagation()}
        >
          @{post.author.username}
        </Link>
        <p className="text-xs text-text-muted">
          {getRelativeDate(post.createdAt)}
        </p>
      </div>

      {isOwner && (
        <PostCardMenu onEdit={onEdit} onDeleteClick={onDeleteClick} />
      )}
    </div>
  );
};

export default PostCardMeta;
