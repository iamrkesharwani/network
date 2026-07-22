import { Link } from 'react-router-dom';
import { USERNAME_CHARSET_PATTERN } from '@network/shared';
import { buildProfilePath } from '../../../features/profile/utils/buildProfilePath';

export interface MentionedTextProps {
  text: string;
  className?: string;
}

const splitPattern = new RegExp(`(@${USERNAME_CHARSET_PATTERN}+)`, 'g');
const testPattern = new RegExp(`^@${USERNAME_CHARSET_PATTERN}+$`);

const MentionedText = ({ text, className }: MentionedTextProps) => {
  const parts = text.split(splitPattern);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        testPattern.test(part) ? (
          <Link
            key={index}
            to={buildProfilePath(part.slice(1))}
            className="text-primary hover:underline"
          >
            {part}
          </Link>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

export default MentionedText;
