/**
 * Default ImageKit assets shared by every shop.
 *
 * Single source of truth lives in `@packages/prisma` (`shop-lifecycle.ts`) so
 * the admin endpoint, the cron, and any future caller agree on which files are
 * never deletable. This file re-exports them for existing cron imports.
 */
export {
  DEFAULT_SHOP_AVATAR_FILE_ID,
  DEFAULT_SHOP_COVER_BANNER_FILE_ID,
  DEFAULT_SHOP_FILE_IDS,
} from "@packages/prisma";
