export type AddressType = {
  name: string;
  id: string;
  country: string;
  label: string;
  phone?: string | null;
  street: string;
  landmark?: string | null;
  city: string;
  zip: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserAddressResponseType = {
  success: boolean;
  address: AddressType;
};

export type GetUserAddressResponseType = {
  success: boolean;
  addresses: Array<AddressType>;
};

export type DeleteUserAddressResponseType = {
  success: boolean;
  message: string;
};
