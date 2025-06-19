import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../lib/axios';
import LoadingSpinner from "../components/UIElements/LoadingSpinner";
import CartProduct from '../components/UIElements/cartProduct';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useUserAuthStore } from '../store/userAuth.store';
import { set } from 'mongoose';
const Cart = () => {
    const { checkAuth, authUser } = useUserAuthStore()
    const isLoggedIn = !!authUser;
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalMrp, setTotalMrp] = useState(0);
    useEffect(() => { checkAuth() }, [checkAuth])

    const purchaseHandler = async () => {
        if (!cart || !cart.products || cart.products.length === 0) {
            toast.error("Your cart is empty!");
            return;
        }

        if (!isLoggedIn) {
            toast.error("Please log in to place an order.");
            navigate("/user/login");
            return;
        }

        try {
            const { data } = await axiosInstance.post(`/order/cobci`);
            const { razorpayOrder, key, username, email, products } = data;


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
                        isCartOrder: true,

                    });

                    alert("Payment success! Order placed.");
                    navigate("/order");

                },
                prefill: {
                    name: username, // Replace with real user name
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
        // setCart(null); // Clear cart after successful purchase
    };


    const changeQuantity = async (productId, quantity) => {
        setLoading(true);
        if (!isLoggedIn) {
            const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
            let updatedCart = storedCart.map(item => {
                if (item.id === productId) {
                    return { ...item, qty: quantity };
                }
                return item;
            });

            updatedCart = updatedCart.filter(item => item.qty > 0); // Remove items with quantity 0
            
            localStorage.setItem("cartItems", JSON.stringify(updatedCart));
            setCart(prevCart => ({
                ...prevCart,
                products: prevCart.products.map(entry =>{
                    if(entry.productId._id === productId) {
                        return {...entry, quantity}
                    }
                    return entry;
                })
            }))
            setLoading(false);
            return;
        }
        setError(null);
        try {
            const response = await axiosInstance.put(`cart/modifyQty/${productId}`, { quantity });
            setCart(response.data.cart);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to change quantity";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const removeProduct = async (productId) => {

        setLoading(true);
        if(!isLoggedIn) {
            const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
            const updatedCart = storedCart.filter(item => item.id !== productId);
            localStorage.setItem("cartItems", JSON.stringify(updatedCart));
            setCart(prevCart => ({
            ...prevCart,
            products: prevCart.products.filter(entry => entry.productId._id !== productId)
            }));
            toast.success("Product removed from cart!");
            setLoading(false);
            return;
        }

        setError(null);
        try {
            const response = await axiosInstance.delete(`cart/remove/${productId}`);
            setCart(response.data.cart);
            // toast.success("Product removed from cart!");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to remove product";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Effect to fetch the cart initially
    useEffect(() => {
        const fetchCart = async () => {

        if (!isLoggedIn) {
            const storedCart = JSON.parse(localStorage.getItem("cartItems"));

            if(storedCart.length > 0) {
                setLoading(true);
                setError(null); // Clear previous errors
                try{
                    const response = await axiosInstance.post("/cart/getProducts", { products: storedCart });
                    setCart(response.data.cart || response.data);
                }catch (err) {
                    const errorMessage = err.response?.data?.message || "Failed to get cart";
                    setError(errorMessage);
                    toast.error(errorMessage);
                }finally {
                    setLoading(false);
                }
            }

            return;
        }

            setLoading(true);
            setError(null); // Clear previous errors
            try {
                const response = await axiosInstance.get("cart/getCart");
                setCart(response.data.cart || response.data);
            } catch (err) {
                const errorMessage = err.response?.data?.message || "Failed to get cart";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    useEffect(() => {
        if (cart && cart.products && cart.products.length > 0) {
            let newTotalPrice = 0;
            let newTotalMrp = 0;

            cart.products.forEach((productEntry) => {
                newTotalPrice += productEntry.productId.price * productEntry.quantity;
                newTotalMrp += productEntry.productId.mrp * productEntry.quantity;
            });

            setTotalPrice(newTotalPrice);
            setTotalMrp(newTotalMrp);
        } else {
            setTotalMrp(0);

            setTotalPrice(0); // Reset to 0 if cart is empty or not loaded
        }
    }, [cart]);

    if (loading && !cart) { // Show initial loading spinner only if cart is not yet loaded
        return <LoadingSpinner asOverlay />;
    }

    if (error && !cart) { // Show error message if cart fetching failed and cart is not available
        toast.error(error); // Display toast on initial load error
        return <p className="text-red-500 text-center p-4">{error}</p>;
    }

    return (
        <div className='bg-gray-100 p-4 min-h-screen'>
            {loading && <LoadingSpinner asOverlay />} {/* Show spinner for actions like quantity change */}
            {error && <p className="text-red-500 text-center pb-4">{error}</p>} {/* Show operational errors */}

            <h1 className="text-2xl font-semibold mb-4 text-center">Your Shopping Cart</h1>
            {cart && cart.products && cart.products.length > 0 ? (
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-3">
                        {cart.products.map((productEntry) => {
                            if (!productEntry || !productEntry.productId) return null;
                            return (
                                <CartProduct
                                    key={productEntry.productId._id}
                                    product={productEntry.productId}
                                    quantity={productEntry.quantity}
                                    changeQuantity={changeQuantity}
                                    removeProduct={removeProduct}
                                />
                            );
                        })}
                    </div>

                    {/* Price Details */}
                    {cart && cart.products && cart.products.length > 0 && <div className="w-full lg:w-96">
                        <div className="p-4 rounded-md bg-white shadow-sm">
                            <h2 className="text-gray-600 font-semibold text-sm mb-4">PRICE DETAILS</h2>

                            <div className="flex justify-between text-base mb-2">
                                <p className="text-gray-800">Price ({cart.products.length} item{cart.products.length > 1 ? 's' : ''})</p>
                                <p className="text-gray-800">₹{totalMrp.toFixed(2)}</p>
                            </div>

                            <div className="flex justify-between text-base mb-2">
                                <p className="text-green-600">Discount</p>
                                <p className="text-green-600">– ₹{(totalMrp - totalPrice).toFixed(2)}</p>
                            </div>

                            <hr className="border-t border-gray-300 mb-4" />

                            <div className="flex justify-between text-lg font-semibold mb-4">
                                <p>Total Amount</p>
                                <p>₹{totalPrice.toFixed(2)}</p>
                            </div>

                            <p className="text-green-600 text-sm mb-4">
                                You will save ₹{(totalMrp - totalPrice).toFixed(2)} on this order
                            </p>

                            <button
                                className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed focus:ring-indigo-500 transition duration-300 ease-in-out disabled:bg-indigo-400 shadow-md"
                                disabled={totalMrp === 0}
                                onClick={purchaseHandler}
                            >
                                Place Order
                            </button>


                        </div>
                    </div>}
                </div>
            ) : (
                !loading && <p className="text-center text-gray-500">Your cart is empty.</p>
            )}

        </div>
    );
};

export default Cart;