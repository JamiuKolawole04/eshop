export type AddressType = {
  name: string;
  id: string;
  country: string;
  label: string;
  street: string;
  city: string;
  zip: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserAddressResponseType = {
  success: true;
  address: AddressType;
};

export type GetUserAddressResponseType = {
  success: true;
  addresses: Array<AddressType>;
};
