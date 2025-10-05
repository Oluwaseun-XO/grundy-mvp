'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, CreditCard, Building, Smartphone, CheckCircle } from 'lucide-react';
import { Order, PaymentMethod } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/paystack';
import { updateOrder } from '@/utils/firebase';
import toast from 'react-hot-toast';

interface OrderCardProps {
  order: Order;
  onOrderUpdate: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onOrderUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showVirtualAccount, setShowVirtualAccount] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

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

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'online': return <CreditCard size={16} />;
      case 'bank_transfer': return <Building size={16} />;
      case 'terminal': return <Smartphone size={16} />;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateOrder(order.id, { orderStatus: newStatus as Order['orderStatus'] });
      toast.success(`Order status updated to ${newStatus}`);
      onOrderUpdate();
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirmation = async () => {
    setLoading(true);
    try {
      await updateOrder(order.id, { 
        paymentStatus: 'paid',
        orderStatus: 'confirmed'
      });
      toast.success('Payment confirmed!');
      onOrderUpdate();
    } catch {
      toast.error('Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayment = async () => {
    if (order.paymentMethod === 'bank_transfer') {
      setShowVirtualAccount(true);
    } else if (order.paymentMethod === 'terminal') {
      setShowTerminal(true);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Order #{order.id.slice(-8)}</h3>
            <p className="text-sm text-gray-600">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
              {order.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Customer Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Customer Information</h4>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <span className="font-medium mr-2">Name:</span>
              {order.customer.name}
            </div>
            <div className="flex items-center">
              <Phone size={14} className="mr-1" />
              {order.customer.phone}
            </div>
            <div className="flex items-center">
              <Mail size={14} className="mr-1" />
              {order.customer.email}
            </div>
            <div className="flex items-center">
              <MapPin size={14} className="mr-1" />
              {order.deliveryAddress}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Order Items</h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{item.product.name} × {item.quantity}</span>
                <span className="font-medium">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between items-center font-semibold">
              <span>Total:</span>
              <span className="text-blue-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getPaymentIcon(order.paymentMethod)}
              <span className="ml-2 font-medium">
                {order.paymentMethod === 'online' && 'Online Checkout'}
                {order.paymentMethod === 'bank_transfer' && 'Bank Transfer on Delivery'}
                {order.paymentMethod === 'terminal' && 'Terminal on Delivery'}
              </span>
            </div>
            
            {order.paymentMethod !== 'online' && order.paymentStatus === 'pending' && (
              <Button
                size="sm"
                onClick={handleRequestPayment}
                className="ml-2"
              >
                Request Payment
              </Button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {order.orderStatus === 'pending' && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('confirmed')}
              loading={loading}
            >
              Confirm Order
            </Button>
          )}
          
          {order.orderStatus === 'confirmed' && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('preparing')}
              loading={loading}
            >
              Start Preparing
            </Button>
          )}
          
          {order.orderStatus === 'preparing' && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('out_for_delivery')}
              loading={loading}
            >
              Out for Delivery
            </Button>
          )}
          
          {order.orderStatus === 'out_for_delivery' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleStatusUpdate('delivered')}
              loading={loading}
            >
              Mark as Delivered
            </Button>
          )}
        </div>

        {/* Virtual Account Modal */}
        {showVirtualAccount && order.virtualAccount && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium mb-2 text-green-800">Virtual Account Details</h4>
            <div className="space-y-1 text-sm">
              <div><strong>Account Number:</strong> {order.virtualAccount.accountNumber}</div>
              <div><strong>Bank:</strong> {order.virtualAccount.bankName}</div>
              <div><strong>Account Name:</strong> {order.virtualAccount.accountName}</div>
              <div><strong>Amount:</strong> {formatCurrency(order.total)}</div>
            </div>
            <div className="flex space-x-2 mt-3">
              <Button
                size="sm"
                variant="success"
                onClick={handlePaymentConfirmation}
                loading={loading}
              >
                <CheckCircle size={16} className="mr-1" />
                Confirm Payment Received
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowVirtualAccount(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Terminal Payment Modal */}
        {showTerminal && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium mb-2 text-purple-800">POS Terminal Payment</h4>
            <div className="text-center py-6">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-lg font-medium mb-2">Amount: {formatCurrency(order.total)}</p>
              <p className="text-sm text-gray-600 mb-4">
                Simulate card tap or insert for payment
              </p>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-purple-300 mb-4">
                <p className="text-sm text-purple-600">
                  💳 Tap card here or insert chip
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="success"
                onClick={handlePaymentConfirmation}
                loading={loading}
                className="flex-1"
              >
                <CheckCircle size={16} className="mr-1" />
                Payment Successful
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowTerminal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};