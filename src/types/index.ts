export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export type PaymentMethod = 'online' | 'bank_transfer' | 'terminal';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  deliveryAddress: string;
  notes?: string;
  paystackReference?: string;
  virtualAccount?: VirtualAccount;
}

export interface VirtualAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
  reference: string;
  customerId: string;
  currency: string;
  active: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  createdAt: Date;
  paystackData?: Record<string, unknown>;
}

export interface Receipt {
  id: string;
  orderId: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
}