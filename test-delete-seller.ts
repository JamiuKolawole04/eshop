/**
 * Test file to verify deleteSellerAccount function works correctly.
 * This is just for verification - not meant to be run in production.
 */

// Test imports
import { deleteSellerAccount } from "./packages/prisma/src/lib/shop-lifecycle.js";
import { deleteImageKitFiles } from "./packages/imagekit/src/lib/imagekit.js";

console.log("Test imports successful!");
console.log("deleteSellerAccount function imported:", typeof deleteSellerAccount);
console.log("deleteImageKitFiles function imported:", typeof deleteImageKitFiles);

// Note: This is just a test file to verify imports work.
// Actual testing would require a proper test environment with database setup.