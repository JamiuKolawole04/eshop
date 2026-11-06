import ProductForm from "@/shared/component/create-product";
import { PayoutGate } from "@/shared/component/payout-gate";

const CreateEventPage = () => (
  <PayoutGate>
    <ProductForm isEvent={true} />
  </PayoutGate>
);

export default CreateEventPage;
