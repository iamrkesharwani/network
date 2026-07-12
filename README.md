# Network

A social media platform built in India, for the world.

## The idea

India has one of the largest and fastest-growing internet populations on earth, and yet most of
the platforms people use every day were never designed for how India actually communicates: across
a dozen languages, on limited data plans, through WhatsApp forwards, and increasingly through voice
rather than text. Network starts from that reality instead of retrofitting it later.

It's a single platform for long-form video, short-form video, and text-and-image posts: one
account, one feed, one creator identity across all three, built with the same ambition as the
platforms it competes with, and a set of design choices that make it genuinely usable for the next
billion people coming online, not just the ones already comfortable with an English-only app.

## What it is

At its core, Network is a content and social platform with three content formats living side by
side:

- **Video** for long-form uploads with a full watch experience
- **Shorts** for vertical, swipeable short-form video
- **Posts** for text and image sharing

Every creator gets one profile, one set of followers, and one dashboard covering all three formats,
rather than forcing people to think of themselves as a "YouTuber" on one app and a "poster" on
another.

## What makes it different

**Language-first, not language-added.** Ten to fifteen Indian languages are supported natively in
the interface, with a transliteration input system that lets someone type in Roman script and get
native-script suggestions as they go, with no separate keyboard app required. Search works across
scripts too, so a query typed in English can surface content posted in Hindi, and vice versa.

**Built for real network conditions.** A dedicated Data Saver mode keeps video quality modest by
default and makes content available for offline viewing, because a meaningful share of the intended
audience is on limited or metered data plans, not unlimited fibre.

**Distribution that matches how content actually spreads here.** Rather than assuming people share
links, Network generates branded, shareable video and image cards built specifically for forwarding
on WhatsApp, the actual distribution channel for a huge amount of content in India today.

**Payments that fit the market and the world.** Creator tipping works through UPI for instant,
native Indian payments, with card-based payments alongside it for a global audience. Nobody is
forced through a payment rail that doesn't make sense for where they live.

**Culturally aware, not just algorithmically ranked.** Trending and discovery surfaces take Indian
festivals and major cricket events into account, instead of relying purely on generic engagement
scoring.

**Community by language and city, not just by follow graph.** People can find and join communities
built around shared language and shared geography, a different and often more relevant discovery
model than a pure follow-based feed.

**Proudly Indian.** The app carries a visible "Made in India" mark. This is a platform built to be
seen as homegrown, not a copy of something built elsewhere.

## Feature highlights

**Content & discovery**

- Unified home feed across video, shorts, and posts
- Trending, following, and curated/editorial shelves
- Full-text and cross-script search with autocomplete
- Personalized recommendations based on watch history

**Social**

- Follow/channel pages per creator
- Likes, threaded comments, and native sharing
- Playlists and bookmarks
- Real-time notifications

**Messaging**

- End-to-end encrypted direct messages: private keys never leave the user's device, so not even
  the platform can read message content

**Creator tools**

- A unified creator dashboard with badges, milestones, and stats across all content types
- Video analytics, including watch time and audience region/device breakdowns
- Scheduled publishing and chapter markers
- UPI and card-based tipping, with a creator fund path for the future

**Trust & safety**

- Full compliance with India's IT Rules and Digital Personal Data Protection Act
- Automated content-safety scanning on every upload
- A transparent takedown and grievance process

**Live** (planned)

- Live streaming with real-time chat and viewer counts, VOD saved automatically when a broadcast
  ends

## Built to last, not built to burn cash

The video pipeline (upload, transcoding, storage, and delivery) is entirely self-hosted rather than
routed through an expensive per-minute third-party video vendor, so the cost of running the
platform doesn't scale unpredictably with usage the way many video-heavy startups do.
Infrastructure choices throughout the project favor fixed, predictable cost over convenience that
comes with a surprise bill attached.

## Where things stand today

The foundation is complete: authentication, video and shorts upload with a real self-hosted
transcoding pipeline, posts, creator profiles, and the core feed are all built and working.
Playback, search, watch history, and the full social layer (follows, comments, likes, playlists,
notifications, and encrypted messaging) are next, followed by the India-first language and
payments work described above, and then a deliberately careful, cost-controlled path to a public
launch.

This is early: pre-launch, with no public users yet. The architecture and the roadmap are already
built for where this is going, not just where it is today.
