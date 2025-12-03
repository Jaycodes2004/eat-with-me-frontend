import apiClient from '../lib/api'; // change path if needed

export interface CreateOrderPayload {
tableNumber?: number;
orderSource: 'dine-in' | 'takeaway';
customerName?: string;
customerPhone?: string;
paymentMethod: 'cash' | 'card' | 'upi' | 'split';
items: Array<{
id: string;
name: string;
quantity: number;
price: number;
category: string;
}>;
}

export async function createOrder(payload: CreateOrderPayload) {
const response = await apiClient.post('/orders', payload);
return response.data; // should be the mapped order from backend (with subtotal/totalAmount)
}