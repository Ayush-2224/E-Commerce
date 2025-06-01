import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import React from "react";

const BuyNowPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const fallbackImage = `https://img.freepik.com/free-photo/cyber-monday-shopping-sales_23-2148688502.jpg?semt=ais_hybrid&w=740`;
  const fetchProduct = async () => {
    try {
      const res = await axiosInstance.get(`product/getProduct/${productId}`);
      if (!res.data) {
        throw new Error("Product not found");
      }
      setProduct(res.data);
    } catch (err) {
      console.error("Error fetching product:", err);
      alert("Product not found");
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const handleBuyNow = async () => {
    try {
      const { data,username,email } = await axiosInstance.post(`/order/cobpi/${productId}`);
      const { razorpayOrder, key } = data;

      const options = {
        key,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "My Store",
        description: "Product Purchase",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          await axiosInstance.post("/order/verify", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            productId,
          });

          alert("Payment success! Order placed.");
        },
        prefill: {
          name: username , // Replace with real user name
          email: email, // Replace with real user email
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error:", err);
      alert("Could not start payment");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-4">Buy Product</h1>

        {product ? (
          <div className="space-y-4">
            <img
              src={product.imageUrl || fallbackImage}
              alt={product.title}
              className="w-full h-64 object-contain p-2 rounded-lg shadow-sm"
              onError={(e) => {
                                e.target.src = fallbackImage;
                              }}
            />
            <div>
              <p className="text-lg font-medium">Name: <span className="text-gray-700">{product.title}</span></p>
              <p className="text-lg font-medium">Brand: <span className="text-gray-700">{product.brand}</span></p>
              <p className="text-lg font-medium">Price: <span className="text-green-600 font-bold">₹{product.price}</span></p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleBuyNow}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Buy Now
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading product details...</p>
        )}
      </div>
    </div>
  );
};

export default BuyNowPage;
