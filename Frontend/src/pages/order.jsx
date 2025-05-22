import React from 'react'
import { useState } from 'react'
import { axiosInstance } from '../lib/axios';
import { useEffect } from 'react';
function Order() {
    const [orders,setOrders]=useState([]);
    useEffect(()=>{
        getOrders();
    },[])
    const getOrders=async()=>{
         try {
            const res=await axiosInstance.get('/order/getOrders');
            console.log(res.data.orders);
            if(res.status===200){
                setOrders(res.data.orders);
            }
         } catch (error) {
            console.error(error);
            alert('Error fetching orders');
         }
    }
    const cancelOrder=async(orderId)=>{
        try {
            const res=await axiosInstance.post(`/order/cancelOrder/${orderId}`);
            if(res.status===200){
                alert('Order cancelled successfully');
                await getOrders();
            }
        } catch (error) {
            console.error(error);
            alert('Error cancelling order');
        }
    }
  return (
    <div>
       <h1>Orders</h1>
         {orders.length===0 && <h2>No orders found</h2>}
        {orders.length>0 && orders.map((orders)=>(
            <div key={orders._id}>

                <h2>Order ID: {orders._id}</h2>
                <h3>Product ID: {orders.productId}</h3>
                <h3>Order Status: {orders.orderStatus}</h3>
                <h3>Payment Status: {orders.paymentStatus}</h3>
                <h3>Order Date: {new Date(orders.createdAt).toLocaleDateString()}</h3>
                <h1><button onClick={()=>cancelOrder(orders._id)}>Cancel Order</button></h1>
                <br />
            </div>
        ))}
    </div>
  )
}

export default Order;
