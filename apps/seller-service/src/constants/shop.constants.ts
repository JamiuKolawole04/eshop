/**
 * Default ImageKit assets shared by every shop.
 *
 * These files back the schema defaults for `Shops.avatar` and
 * `Shops.coverBanner`, so they must never be deleted from ImageKit while
 * cleaning up an individual shop.
 */
export const DEFAULT_SHOP_AVATAR_FILE_ID = "6a8078ae5c7cd75eb81f31dc";
export const DEFAULT_SHOP_COVER_BANNER_FILE_ID = "6a8f875d5c7cd75eb81ddeaa";

export const DEFAULT_SHOP_FILE_IDS: ReadonlySet<string> = new Set([
  DEFAULT_SHOP_AVATAR_FILE_ID,
  DEFAULT_SHOP_COVER_BANNER_FILE_ID,
]);
