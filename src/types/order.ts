export type Network = 'MTN' | 'Vodafone' | 'AirtelTigo';
export type OrderStatus = 'pending' | 'success' | 'failed';

export interface Order {
  id?: string;
  userId: string;
  network: Network;
  phone: string;
  amount: number;
  status: OrderStatus;
  createdAt?: Date;
}
