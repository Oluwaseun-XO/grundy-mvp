'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, Search } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/paystack';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';


export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    if (!customerEmail) return;

    const q = query(
      collection(db, 'orders'),
      where('customer.email', '==', customerEmail),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      setOrders(orderData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [customerEmail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerEmail(searchEmail);
    setLoading(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-600" />;
      case 'confirmed': return <CheckCircle className="text-blue-600" />;
      case 'preparing': return <Package className="text-orange-600" />;
      case 'out_for_delivery': return <Truck className="text-purple-600" />;
      case 'delivered': return <CheckCircle className="text-green-600" />;
      default: return <Package className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/customer">
                <Button variant="secondary" size="sm">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Shop
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-600">Track your order status</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!customerEmail ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <h2 className="text-xl font-semibold">Track Your Orders</h2>
              <p className="text-sm text-gray-600">Enter your email to view your orders</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Search size={16} className="mr-2" />
                  View My Orders
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Orders for {customerEmail}</h2>
                <p className="text-sm text-gray-600">{orders.length} orders found</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCustomerEmail('');
                  setSearchEmail('');
                }}
              >
                Search Different Email
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600">You haven't placed any orders yet.</p>
                  <Link href="/customer">
                    <Button className="mt-4">Start Shopping</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Order #{order.id.slice(-8)}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.orderStatus)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Order Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.product.name} × {item.quantity}</span>
                                <span className="font-medium">
                                  {formatCurrency(item.product.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                            <div className="border-t pt-2 flex justify-between font-semibold">
                              <span>Total:</span>
                              <span className="text-blue-600">{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Delivery Information</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Address:</span>
                              <p className="font-medium">{order.deliveryAddress}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Payment Method:</span>
                              <p className="font-medium">
                                {order.paymentMethod === 'online' && 'Online Checkout'}
                                {order.paymentMethod === 'bank_transfer' && 'Bank Transfer'}
                                {order.paymentMethod === 'terminal' && 'POS Terminal'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Payment Status:</span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                {order.paymentStatus.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {order.paymentMethod === 'bank_transfer' && order.paymentStatus === 'pending' && order.virtualAccount && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <h5 className="font-medium text-green-800 mb-2">Transfer Details</h5>
                              <div className="space-y-1 text-sm">
                                <div><strong>Bank:</strong> {order.virtualAccount.bankName}</div>
                                <div><strong>Account:</strong> {order.virtualAccount.accountNumber}</div>
                                <div><strong>Name:</strong> {order.virtualAccount.accountName}</div>
                                <div><strong>Amount:</strong> {formatCurrency(order.total)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Timeline */}
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-medium mb-3">Order Status Timeline</h4>
                        <div className="space-y-2">
                          <div className={`flex items-center ${order.orderStatus === 'pending' || order.orderStatus === 'confirmed' || order.orderStatus === 'preparing' || order.orderStatus === 'out_for_delivery' || order.orderStatus === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircle size={16} className="mr-2" />
                            <span className="text-sm">Order Placed</span>
                          </div>
                          <div className={`flex items-center ${order.orderStatus === 'confirmed' || order.orderStatus === 'preparing' || order.orderStatus === 'out_for_delivery' || order.orderStatus === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircle size={16} className="mr-2" />
                            <span className="text-sm">Order Confirmed</span>
                          </div>
                          <div className={`flex items-center ${order.orderStatus === 'preparing' || order.orderStatus === 'out_for_delivery' || order.orderStatus === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                            <Package size={16} className="mr-2" />
                            <span className="text-sm">Preparing Order</span>
                          </div>
                          <div className={`flex items-center ${order.orderStatus === 'out_for_delivery' || order.orderStatus === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                            <Truck size={16} className="mr-2" />
                            <span className="text-sm">Out for Delivery</span>
                          </div>
                          <div className={`flex items-center ${order.orderStatus === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircle size={16} className="mr-2" />
                            <span className="text-sm">Delivered</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
