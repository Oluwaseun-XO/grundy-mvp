'use client';

import React, { useState } from 'react';
import { Search, ShoppingCart, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { products } from '@/data/products';
import { ProductCard } from '@/components/customer/ProductCard';
import { Cart } from '@/components/customer/Cart';
import { CheckoutModal } from '@/components/customer/CheckoutModal';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { PaymentMethod, Customer, Order } from '@/types';
import { createOrder, createTransaction, createReceipt, updateOrderPaymentStatus } from '@/utils/firebase';
import { initializePaystackPayment, generateReference, createVirtualAccount } from '@/utils/paystack';
import { calculateSplit } from '@/utils/paystack-split';
import toast from 'react-hot-toast';

export default function CustomerPage() {
  const { state, clearCart, getItemCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePayment = async (paymentMethod: PaymentMethod, customer: Customer) => {
    try {
      const reference = generateReference();

      // Calculate split payment details
      const splitDetails = calculateSplit(state.total);
      
      // Get unique merchants from cart items
      const merchants = [...new Set(state.items.map(item => item.product.merchant))];

      const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        customer,
        items: state.items,
        total: state.total,
        paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'pending' : 'pending',
        orderStatus: 'pending',
        deliveryAddress: customer.address,
        paystackReference: reference,
        platformFee: splitDetails.platformFee,
        merchantAmount: splitDetails.merchantAmount,
        merchants,
      };

      if (paymentMethod === 'online') {
        // Create order first with pending status
        const orderId = await createOrder({
          ...orderData,
          paymentStatus: 'pending',
          orderStatus: 'pending',
        });

        // Online payment with Paystack
        initializePaystackPayment(
          customer.email,
          state.total,
          reference,
          async (response: Record<string, unknown>) => {
            try {
              // Update order status to paid
              await updateOrderPaymentStatus(orderId, 'paid', 'confirmed');

              // Create transaction record
              await createTransaction({
                orderId,
                amount: state.total,
                paymentMethod: 'online',
                status: 'paid',
                reference: (response.reference as string) || reference,
                paystackData: response,
              });

              // Create receipt
              await createReceipt({
                orderId,
                customerEmail: customer.email,
                items: state.items,
                total: state.total,
                paymentMethod: 'online',
              });

              toast.success('Payment successful! Order confirmed.');
              clearCart();
              setShowCheckout(false);
            } catch (error) {
              console.error('Error processing successful payment:', error);
              toast.error('Payment successful but order processing failed. Please contact support.');
            }
          },
          () => {
            toast.error('Payment cancelled');
          },
          { orderId } // Pass order ID in metadata for webhook processing
        );
      } else if (paymentMethod === 'bank_transfer') {
        // Create order first
        const orderId = await createOrder(orderData);
        
        // Bank transfer - create virtual account
        const virtualAccount = await createVirtualAccount(orderId, customer.email, state.total);
        
        if (virtualAccount) {
          // Update order with virtual account details
          await updateOrderPaymentStatus(orderId, 'pending', 'pending');

          // Create transaction record
          await createTransaction({
            orderId,
            amount: state.total,
            paymentMethod: 'bank_transfer',
            status: 'pending',
            reference,
          });

          toast.success('Order placed! Virtual account details will be provided to the rider.');
          clearCart();
          setShowCheckout(false);
        } else {
          throw new Error('Failed to create virtual account');
        }
      } else if (paymentMethod === 'terminal') {
        // Terminal payment - just create order
        const finalOrderId = await createOrder(orderData);

        // Create transaction record
        await createTransaction({
          orderId: finalOrderId,
          amount: state.total,
          paymentMethod: 'terminal',
          status: 'pending',
          reference,
        });

        toast.success('Order placed! Payment will be processed on delivery via POS terminal.');
        clearCart();
        setShowCheckout(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="secondary" size="sm">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Grundy Store</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowCart(!showCart)}
                variant="secondary"
                className="relative"
              >
                <ShoppingCart size={20} />
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold mb-4">Search Products</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Filter size={20} className="mr-2" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Products */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                  </h2>
                  <p className="text-gray-600">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                  </div>
                )}
              </div>

              {/* Cart */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <Cart onCheckout={() => setShowCheckout(true)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onPayment={handlePayment}
      />
    </div>
  );
}