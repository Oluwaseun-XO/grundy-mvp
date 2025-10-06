import { useState } from 'react';

export default function RiderPaymentModal({ order }) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [reference, setReference] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const handleRequestPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/paystack/create-virtual-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          customerEmail: order.customerEmail,
          amount: order.total,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentUrl(data.authorizationUrl);
        setReference(data.reference);
        setShowModal(true);
      } else {
        setError(data.error || 'Failed to generate payment link');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Optionally check payment status here
    if (order.onModalClosed) {
      order.onModalClosed(reference);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (showModal && paymentUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Show this to Customer</h3>
              <p className="text-sm text-gray-600">Order #{order.id} - ₦{order.total.toLocaleString()}</p>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <iframe
              src={paymentUrl}
              className="w-full h-full border-0"
              title="Payment Details"
            />
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => copyToClipboard(paymentUrl)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
              >
                Copy Payment Link
              </button>
              <button
                onClick={() => window.open(paymentUrl, '_blank')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded text-sm"
              >
                Open in New Tab
              </button>
            </div>
            <button
              onClick={handleCloseModal}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded"
            >
              Done - Customer Has Seen Details
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Payment will be automatically confirmed via webhook when customer transfers
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Transfer on Delivery</h3>
        <p className="text-gray-600">Order #{order.id}</p>
        <p className="text-2xl font-bold text-gray-800 mt-2">₦{order.total.toLocaleString()}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleRequestPayment}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded transition-colors"
      >
        {loading ? 'Generating Payment Link...' : 'Request Payment from Customer'}
      </button>

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">How it works:</h4>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>Click the button above to generate payment details</li>
          <li>Show the screen to the customer</li>
          <li>Customer will see bank account to transfer to</li>
          <li>Customer makes transfer from their banking app</li>
          <li>Order is automatically confirmed when payment received</li>
        </ol>
      </div>
    </div>
  );
}

// Example usage:
// <RiderPaymentModal 
//   order={{
//     id: 'ORD123',
//     customerEmail: 'customer@example.com',
//     total: 5000,
//     onModalClosed: (reference) => {
//       console.log('Modal closed, checking payment status...');
//       // Optionally poll for payment status
//     }
//   }}
// />
