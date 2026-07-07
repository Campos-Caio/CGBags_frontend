export interface FreightCompany {
  id: number;
  name: string;
  picture: string;
}

export interface FreightDeliveryRange {
  min: number;
  max: number;
}

export interface FreightOption {
  id: number;
  name: string;
  company: FreightCompany;
  price: string;
  custom_price: string | null;
  delivery_time: number | null;
  delivery_range: FreightDeliveryRange | null;
}
