import {
  FaXTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaGithub,
  FaFacebook,
  FaTiktok,
} from 'react-icons/fa6';
import { Link2 } from 'lucide-react';
import type { SocialPlatform } from '@network/shared';

export const socialPlatformMeta: Record<
  SocialPlatform,
  { label: string; icon: typeof FaXTwitter | typeof Link2 }
> = {
  x: { label: 'X', icon: FaXTwitter },
  instagram: { label: 'Instagram', icon: FaInstagram },
  youtube: { label: 'YouTube', icon: FaYoutube },
  linkedin: { label: 'LinkedIn', icon: FaLinkedin },
  github: { label: 'GitHub', icon: FaGithub },
  facebook: { label: 'Facebook', icon: FaFacebook },
  tiktok: { label: 'TikTok', icon: FaTiktok },
  other: { label: 'Other', icon: Link2 },
};
