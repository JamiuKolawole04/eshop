import { BlockList, isIP } from "node:net";

import { isPrivateIp } from "./geo";

const CLOUDFLARE_IPV4: ReadonlyArray<readonly [string, number]> = [
  ["173.245.48.0", 20],
  ["103.21.244.0", 22],
  ["103.22.200.0", 22],
  ["103.31.4.0", 22],
  ["141.101.64.0", 18],
  ["108.162.192.0", 18],
  ["190.93.240.0", 20],
  ["188.114.96.0", 20],
  ["197.234.240.0", 22],
  ["198.41.128.0", 17],
  ["162.158.0.0", 15],
  ["104.16.0.0", 13],
  ["104.24.0.0", 14],
  ["172.64.0.0", 13],
  ["131.0.72.0", 22],
];

const CLOUDFLARE_IPV6: ReadonlyArray<readonly [string, number]> = [
  ["2400:cb00::", 32],
  ["2606:4700::", 32],
  ["2803:f800::", 32],
  ["2405:b500::", 32],
  ["2405:8100::", 32],
  ["2a06:98c0::", 29],
  ["2c0f:f248::", 32],
];

const cloudflareRanges = new BlockList();

for (const [address, prefix] of CLOUDFLARE_IPV4) {
  cloudflareRanges.addSubnet(address, prefix, "ipv4");
}

for (const [address, prefix] of CLOUDFLARE_IPV6) {
  cloudflareRanges.addSubnet(address, prefix, "ipv6");
}

export const isCloudflareIp = (ip: string): boolean => {
  const version = isIP(ip);

  if (version === 0) return false;

  return cloudflareRanges.check(ip, version === 4 ? "ipv4" : "ipv6");
};

export const isTrustedProxy = (ip: string): boolean =>
  isPrivateIp(ip) || isCloudflareIp(ip);
