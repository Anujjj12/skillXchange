import { useState, useEffect } from "react";
import {
  createOrder,
  verifyPayment,
  getSubscriptionStatus,
} from "../api/paymentApi";
import useAuth from "@/hooks/useAuth";

const Subscription = () => {

  const plans = {
    Basic: { connectionsAllowed: 5, price: 99 },
    Premium: { connectionsAllowed: 15, price: 299 },
  };
  
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuth();
  useEffect(() => {
    if (!currentUser._id) return;

    const fetchSubscriptionStatus = async () => {
      try {
        const data = await getSubscriptionStatus(currentUser._id);

        // 🛠️ Check if the subscription is expired
        const now = new Date();
        const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
        const isExpired = expiryDate && expiryDate < now;

        setSubscription({
          ...data,
          isSubscribed: data.isSubscribed && !isExpired, // Mark as unsubscribed if expired
        });
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [currentUser._id]);

  const handleSubscribe = async (planName) => {
    try {
      const orderData = await createOrder(currentUser._id, planName);

      const options = {
        key: "rzp_test_dMsLDQLJDCGKIF",
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "Your Website Name",
        description: `Subscription for ${planName}`,
        handler: async (response) => {
          try {
            await verifyPayment(currentUser._id, planName, response);
            alert("Subscription activated successfully!");
            setSubscription((prev) => ({
              ...prev,
              isSubscribed: true,
              plan: planName,
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              connectionsLeft: plans[planName].connectionsAllowed,
            }));
          } catch (error) {
            alert("Payment verification failed");
          }
        },
        theme: { color: "#3399cc" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("Failed to initiate payment");
    }
  };

  if (loading) return <p>Loading subscription details...</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Subscription Plans</h2>

      {subscription?.isSubscribed ? (
        <p className="text-green-500">
          Subscribed to <strong>{subscription.plan}</strong> until{" "}
          {new Date(subscription.expiryDate).toDateString()}
        </p>
      ) : (
        <p className="text-red-500">
          No active subscription. You have{" "}
          <strong>{subscription.connectionsLeft || 2}</strong> free connections.
        </p>
      )}

      <div className="flex space-x-4 mt-4">
        <div className="p-4 border rounded shadow-md">
          <h3 className="text-xl font-semibold">Basic Plan</h3>
          <p>₹99/month</p>
          <button
            onClick={() => handleSubscribe("Basic")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Subscribe
          </button>
        </div>

        <div className="p-4 border rounded shadow-md">
          <h3 className="text-xl font-semibold">Premium Plan</h3>
          <p>₹299/month</p>
          <button
            onClick={() => handleSubscribe("Premium")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
