export type FileType = {
  id: string;
  file_id: string;
  url: string;
  userId: string | null;
  shopId: string | null;
  productId: string;
  createdAt: string;
  updatedAt: string;
};

export type UploadFileResponseType = {
  fileUrl: string;
  fileName: string;
};
