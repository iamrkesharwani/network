import type { SocialPlatform } from '../modules/user/user.constants.js';

export interface KnownSocialPlatform {
  key: string;
  name: string;
  domains: string[];
}

export const SOCIAL_PLATFORM_DOMAINS: Record<Exclude<SocialPlatform, 'other'>, string[]> = {
  x: ['x.com', 'twitter.com'],
  instagram: ['instagram.com'],
  youtube: ['youtube.com', 'youtu.be'],
  linkedin: ['linkedin.com'],
  github: ['github.com'],
  facebook: ['facebook.com', 'fb.com'],
};

export const KNOWN_SOCIAL_PLATFORMS: KnownSocialPlatform[] = [
  { key: 'threads', name: 'Threads', domains: ['threads.net'] },
  { key: 'snapchat', name: 'Snapchat', domains: ['snapchat.com'] },
  { key: 'pinterest', name: 'Pinterest', domains: ['pinterest.com'] },
  { key: 'reddit', name: 'Reddit', domains: ['reddit.com'] },
  { key: 'discord', name: 'Discord', domains: ['discord.com', 'discord.gg'] },
  { key: 'twitch', name: 'Twitch', domains: ['twitch.tv'] },
  { key: 'telegram', name: 'Telegram', domains: ['telegram.org', 't.me'] },
  { key: 'whatsapp', name: 'WhatsApp', domains: ['whatsapp.com', 'wa.me'] },
  { key: 'signal', name: 'Signal', domains: ['signal.org'] },
  { key: 'line', name: 'Line', domains: ['line.me'] },
  { key: 'wechat', name: 'WeChat', domains: ['wechat.com'] },
  { key: 'medium', name: 'Medium', domains: ['medium.com'] },
  { key: 'substack', name: 'Substack', domains: ['substack.com'] },
  { key: 'behance', name: 'Behance', domains: ['behance.net'] },
  { key: 'dribbble', name: 'Dribbble', domains: ['dribbble.com'] },
  { key: 'spotify', name: 'Spotify', domains: ['spotify.com'] },
  { key: 'soundcloud', name: 'SoundCloud', domains: ['soundcloud.com'] },
  { key: 'bandcamp', name: 'Bandcamp', domains: ['bandcamp.com'] },
  { key: 'apple-music', name: 'Apple Music', domains: ['music.apple.com'] },
  { key: 'mastodon', name: 'Mastodon', domains: [] },
  { key: 'bluesky', name: 'Bluesky', domains: ['bsky.app'] },
  { key: 'tumblr', name: 'Tumblr', domains: ['tumblr.com'] },
  { key: 'vimeo', name: 'Vimeo', domains: ['vimeo.com'] },
  { key: 'patreon', name: 'Patreon', domains: ['patreon.com'] },
  { key: 'kofi', name: 'Ko-fi', domains: ['ko-fi.com'] },
  {
    key: 'buymeacoffee',
    name: 'Buy Me a Coffee',
    domains: ['buymeacoffee.com'],
  },
  { key: 'gumroad', name: 'Gumroad', domains: ['gumroad.com'] },
  { key: 'cashapp', name: 'Cash App', domains: ['cash.app'] },
  { key: 'venmo', name: 'Venmo', domains: ['venmo.com'] },
  { key: 'quora', name: 'Quora', domains: ['quora.com'] },
  { key: 'flickr', name: 'Flickr', domains: ['flickr.com'] },
  { key: 'vsco', name: 'VSCO', domains: ['vsco.co'] },
  { key: 'clubhouse', name: 'Clubhouse', domains: ['joinclubhouse.com'] },
  { key: 'bereal', name: 'BeReal', domains: ['bereal.com'] },
  { key: 'letterboxd', name: 'Letterboxd', domains: ['letterboxd.com'] },
  { key: 'goodreads', name: 'Goodreads', domains: ['goodreads.com'] },
  { key: 'producthunt', name: 'Product Hunt', domains: ['producthunt.com'] },
  { key: 'devto', name: 'Dev.to', domains: ['dev.to'] },
  {
    key: 'stackoverflow',
    name: 'Stack Overflow',
    domains: ['stackoverflow.com'],
  },
  { key: 'codepen', name: 'CodePen', domains: ['codepen.io'] },
  { key: 'figma', name: 'Figma', domains: ['figma.com'] },
  { key: 'notion', name: 'Notion', domains: ['notion.so'] },
  { key: 'steam', name: 'Steam', domains: ['steamcommunity.com'] },
  { key: 'kick', name: 'Kick', domains: ['kick.com'] },
  { key: 'rumble', name: 'Rumble', domains: ['rumble.com'] },
  { key: 'strava', name: 'Strava', domains: ['strava.com'] },
  { key: 'tiktok', name: 'TikTok', domains: ['tiktok.com'] },
];
