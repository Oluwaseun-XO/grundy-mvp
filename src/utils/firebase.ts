import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, Transaction, Receipt } from '@/types';

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      const data = orderSnap.data();
      return {
        id: orderSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Order;
    }
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(ordersQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Order[];
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(ordersQuery, (querySnapshot) => {
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Order[];
    
    callback(orders);
  });
};

export const updateOrderPaymentStatus = async (
  orderId: string, 
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      paymentStatus,
      orderStatus,
      updatedAt: Timestamp.now(),
    });
    console.log(`Order ${orderId} updated: payment=${paymentStatus}, status=${orderStatus}`);
  } catch (error) {
    console.error('Error updating order payment status:', error);
    throw error;
  }
};

export const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const createReceipt = async (receiptData: Omit<Receipt, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'receipts'), {
      ...receiptData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating receipt:', error);
    throw error;
  }
};

export const getTransactionsByOrderId = async (orderId: string): Promise<Transaction[]> => {
  try {
    const transactionsQuery = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(transactionsQuery);
    
    const transactions = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Transaction[];
    
    return transactions.filter(transaction => transaction.orderId === orderId);
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};