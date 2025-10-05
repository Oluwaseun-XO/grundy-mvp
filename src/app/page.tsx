import Link from 'next/link';
import { ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">Grundy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience seamless ordering with multiple payment options. 
            Shop online, pay your way, and get your items delivered fast.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Customer App</h2>
              <p className="text-gray-600 mb-6">
                Browse our catalog, add items to cart, and choose from three payment methods:
                Online Checkout, Bank Transfer on Delivery, or Terminal on Delivery.
              </p>
              <Link href="/customer">
                <Button size="lg" className="w-full">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Rider App</h2>
              <p className="text-gray-600 mb-6">
                Manage orders, track deliveries, and process payments on delivery.
                Real-time order updates and payment confirmation tools.
              </p>
              <Link href="/rider">
                <Button size="lg" variant="success" className="w-full">
                  Rider Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-8">Payment Methods Supported</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 text-3xl mb-2">💳</div>
              <h4 className="font-semibold mb-2">Online Checkout</h4>
              <p className="text-sm text-gray-600">Instant payment with Paystack</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-green-600 text-3xl mb-2">🏦</div>
              <h4 className="font-semibold mb-2">Bank Transfer</h4>
              <p className="text-sm text-gray-600">Virtual account on delivery</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-purple-600 text-3xl mb-2">📱</div>
              <h4 className="font-semibold mb-2">POS Terminal</h4>
              <p className="text-sm text-gray-600">Card payment on delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
