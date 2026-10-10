export const SOCIAL_HOSTS = {
  youtube: ["youtube.com", "youtu.be"],
  x: ["x.com", "twitter.com"],
} as const;

export type SocialType = keyof typeof SOCIAL_HOSTS;
