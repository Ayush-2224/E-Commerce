import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";

const fallbackImage = `https://img.freepik.com/free-photo/cyber-monday-shopping-sales_23-2148688502.jpg?semt=ais_hybrid&w=740`;

function Order() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async () => {
    try {
      const res = await axiosInstance.get("/order/getOrders");
      if (res.status === 200) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching orders");
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await axiosInstance.post(`/order/cancelOrder/${orderId}`);
      if (res.status === 200) {
        alert("Order cancelled successfully");
        await getOrders();
      }
    } catch (error) {
      console.error(error);
      alert("Error cancelling order");
    }
  };

  const handleRateProduct = (productId) => {
    window.open(`/product/${productId}/review`);
  };

  const calculateDiscount = (mrp, price) => {
    if (mrp && price) {
      return `${Math.round(((mrp - price) / mrp) * 100)}% off`;
    }
    return "";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Order Delivered":
        return "text-green-600";
      case "Order Placed":
        return "text-blue-600";
      case "Order Cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Order Delivered":
        return "🟢";
      case "Order Placed":
        return "🟡";
      case "Order Cancelled":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            My Orders
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                No Orders Found
              </h2>
              <p className="text-gray-600">
                You haven't placed any orders yet. Start shopping to see your
                orders here!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {order.productId.map((product, index) => (
                  <div
                    key={product._id}
                    className={`${index > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <Link
                      to={`/product/${product._id}`}
                      className="block hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="p-6">
                        <div className="flex gap-6 items-start">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={product.imageUrl || fallbackImage}
                              alt={product.title}
                              className="w-24 h-24 object-contain rounded-lg border border-gray-100"
                              onError={(e) => {
                                e.target.src = fallbackImage;
                              }}
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-1">
                                  {product.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                  Brand: {product.brand || "Unknown Brand"}
                                </p>

                                {/* Price (show once per order) */}
                                {index === 0 && (
                                  <div className="mb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="text-2xl font-bold text-gray-900">
                                        ₹{order.price.toLocaleString()}
                                      </span>
                                      <span className="text-lg text-gray-500 line-through">
                                        ₹{order.mrp.toLocaleString()}
                                      </span>
                                      <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                                        {calculateDiscount(
                                          order.mrp,
                                          order.price
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Order & Payment Status */}
                                <div className="flex items-center gap-4 mb-4">
                                  <div
                                    className={`flex items-center gap-2 ${getStatusColor(
                                      order.orderStatus
                                    )}`}
                                  >
                                    <span>{getStatusIcon(order.orderStatus)}</span>
                                    <span className="font-medium">
                                      {order.orderStatus === "Order Delivered" &&
                                        order.createdAt
                                        ? `Delivered on ${formatDate(
                                          order.createdAt
                                        )}`
                                        : order.orderStatus}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Payment:{" "}
                                    <span className="font-medium">
                                      {order.paymentStatus}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">
                                  Order Date: <span className="font-medium">{formatDate(order.createdAt)}</span>
                                </p>

                                {order.orderStatus === "Order Delivered" && (
                                  <p className="text-sm text-gray-600 mb-4">
                                    Your item has been delivered
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col items-end gap-2 mt-2">
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRateProduct(product._id);
                              }}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200 cursor-pointer"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Rate & Review Product
                            </div>

                            {order.orderStatus !== "Order Cancelled" &&
                              index === 0 && (
                                <div
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    cancelOrder(order._id);
                                  }}
                                  className="mt-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm rounded-lg border border-red-200 transition-colors duration-200 cursor-pointer"
                                >
                                  Cancel Order
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Order;
