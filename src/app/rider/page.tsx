'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Truck, Package, Clock, CheckCircle, Filter } from 'lucide-react';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types';
import { OrderCard } from '@/components/rider/OrderCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { subscribeToOrders } from '@/utils/firebase';
import toast from 'react-hot-toast';

export default function RiderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const statusOptions = [
    { value: 'all' as const, label: 'All Orders', icon: Package },
    { value: 'pending' as const, label: 'Pending', icon: Clock },
    { value: 'confirmed' as const, label: 'Confirmed', icon: CheckCircle },
    { value: 'preparing' as const, label: 'Preparing', icon: Package },
    { value: 'out_for_delivery' as const, label: 'Out for Delivery', icon: Truck },
    { value: 'delivered' as const, label: 'Delivered', icon: CheckCircle },
  ];

  useEffect(() => {
    const unsubscribe = subscribeToOrders((newOrders) => {
      setOrders(newOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.orderStatus === selectedStatus));
    }
  }, [orders, selectedStatus]);

  const handleOrderUpdate = () => {
    // Orders will be updated automatically through the subscription
    toast.success('Order updated successfully!');
  };

  const getStatusStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.orderStatus === 'pending').length,
      confirmed: orders.filter(o => o.orderStatus === 'confirmed').length,
      preparing: orders.filter(o => o.orderStatus === 'preparing').length,
      outForDelivery: orders.filter(o => o.orderStatus === 'out_for_delivery').length,
      delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rider Dashboard</h1>
                <p className="text-sm text-gray-600">Manage orders and deliveries</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {stats.total} Total Orders
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.preparing}</div>
              <div className="text-sm text-gray-600">Preparing</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.outForDelivery}</div>
              <div className="text-sm text-gray-600">Out for Delivery</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
              <div className="text-sm text-gray-600">Delivered</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center">
                  <Filter size={20} className="mr-2" />
                  Filter Orders
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const count = option.value === 'all' ? stats.total : 
                                 orders.filter(o => o.orderStatus === option.value).length;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSelectedStatus(option.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          selectedStatus === option.value
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon size={16} className="mr-2" />
                          {option.label}
                        </div>
                        <span className="text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Orders */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedStatus === 'all' ? 'All Orders' : 
                 statusOptions.find(s => s.value === selectedStatus)?.label}
              </h2>
              <p className="text-gray-600">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600">
                    {selectedStatus === 'all' 
                      ? 'No orders have been placed yet.' 
                      : `No orders with status "${selectedStatus}" found.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onOrderUpdate={handleOrderUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}