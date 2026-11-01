import ImageKit from "@imagekit/nodejs";

export const imageKit = new ImageKit({
  privateKey: process.env["IMAGEKIT_PRIVATE_KEY"],
});

export async function deleteImageKitFiles(
  fileIds: readonly string[],
  context?: string,
): Promise<void> {
  await Promise.all(
    fileIds.map(async (fileId) => {
      try {
        await imageKit.files.delete(fileId);
      } catch (error) {
        console.error(
          `Failed to delete ImageKit file ${fileId}${
            context ? ` for ${context}` : ""
          }:`,
          error,
        );
      }
    }),
  );
}
