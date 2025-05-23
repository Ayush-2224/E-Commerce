import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import React from "react";
const BuyNowPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
const fetchProduct = async () => {
    console.log("Fetching product with ID:", productId);
      try {
        const res =  await axiosInstance.get(`product/getProduct/${productId}`);
        console.log("Product fetched successfully:", res.data);
        if(!res.data) {
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
      const { data } = await axiosInstance.post(`/order/cobpi/${productId}`);
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
          name: "User",
          email: "user@example.com",
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
    <div>
      <h1>Buy Product</h1>
      {product && (
        <>
          <p>Name: {product.title}</p>
          <p>Brand: {product.brand}</p>
          <p>Price: ₹{product.price}</p>
        </>
      )}
      <button onClick={handleBuyNow}>Buy Now</button>
    </div>
  );
};

export default BuyNowPage;
