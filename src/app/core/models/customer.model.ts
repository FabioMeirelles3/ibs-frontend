import type { Address } from "./address.model";

export interface Customer {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  maritialStatus: string;
  active: boolean;
  addresses: Address[]
}
