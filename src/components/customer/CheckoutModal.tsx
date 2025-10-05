'use client';

import React, { useState } from 'react';
import { CreditCard, Building, Smartphone } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useCart } from '@/contexts/CartContext';
import { PaymentMethod, Customer } from '@/types';
import { formatCurrency } from '@/utils/paystack';
import { calculateSplit } from '@/utils/paystack-split';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (paymentMethod: PaymentMethod, customer: Customer) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onPayment
}) => {
  const { state } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('online');
  const [customer, setCustomer] = useState<Omit<Customer, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    {
      id: 'online' as PaymentMethod,
      name: 'Online Checkout',
      description: 'Pay instantly with Paystack',
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      id: 'bank_transfer' as PaymentMethod,
      name: 'Bank Transfer on Delivery',
      description: 'Transfer to virtual account when rider arrives',
      icon: Building,
      color: 'text-green-600'
    },
    {
      id: 'terminal' as PaymentMethod,
      name: 'Terminal on Delivery',
      description: 'Pay with POS terminal when rider arrives',
      icon: Smartphone,
      color: 'text-purple-600'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const customerWithId: Customer = {
        ...customer,
        id: `customer_${Date.now()}`
      };
      
      await onPayment(selectedPaymentMethod, customerWithId);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = customer.name && customer.email && customer.phone && customer.address;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address *
              </label>
              <textarea
                required
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your delivery address"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-medium mb-4">Payment Method</h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className="cursor-pointer transition-all"
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <Card
                    className={`${
                      selectedPaymentMethod === method.id
                        ? 'ring-2 ring-blue-500 border-blue-500'
                        : 'hover:border-gray-300'
                    }`}
                  >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={() => setSelectedPaymentMethod(method.id)}
                        className="text-blue-600"
                      />
                      <Icon className={`h-6 w-6 ${method.color}`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Order Summary</h3>
          <div className="space-y-2">
            {state.items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>{item.product.name} × {item.quantity}</span>
                <span>{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-blue-600">{formatCurrency(state.total)}</span>
              </div>
            </div>
            
            {/* Split Payment Breakdown */}
            <div className="border-t pt-2 mt-2 text-xs text-gray-600">
              <div className="mb-2">
                <span className="font-medium">Payment Split:</span>
              </div>
              <div className="flex justify-between">
                <span>• Merchants (90%):</span>
                <span>{formatCurrency(calculateSplit(state.total).merchantAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>• Grundy Platform Fee (10%):</span>
                <span>{formatCurrency(calculateSplit(state.total).platformFee)}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Merchants: {[...new Set(state.items.map(item => item.product.merchant))].join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid || loading}
            loading={loading}
            className="flex-1"
          >
            {selectedPaymentMethod === 'online' ? 'Pay Now' : 'Place Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};