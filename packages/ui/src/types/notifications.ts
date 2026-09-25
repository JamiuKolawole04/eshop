export type NotificationsResponseType = {
  success: boolean;
  message: string;
  notifications: Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    status: string;
    creatorId: string;
    receiverId: string;
    redirectLink: string;
    message: string;
  }>;
};
