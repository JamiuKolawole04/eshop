import ProductForm from "@/shared/component/create-product";
import { PayoutGate } from "@/shared/component/payout-gate";

const CreateProductPage = () => (
  <PayoutGate>
    <ProductForm isEvent={false} />
  </PayoutGate>
);

export default CreateProductPage;
