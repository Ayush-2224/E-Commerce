import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../lib/axios'
import LoadingSpinner from "../components/UIElements/LoadingSpinner"
import CartProduct from '../components/UIElements/cartProduct'
import toast from 'react-hot-toast'
const Cart = () => {
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(false)
    const[error, setError] = useState(null)

    const changeQuantity = async (productId, quantity) => {
        setLoading(true)
        try{
            const response = await axiosInstance.put(`cart/modifyQty/${productId}`, {quantity})
            setCart(response.data.cart)
        }catch(err){
            setError("Failed to change quantity")
        }finally{
            setLoading(false)
        }
    }

    const removeProduct = async (productId) => {
        setLoading(true)
        try{
            const response = await axiosInstance.delete(`cart/remove/${productId}`)
            setCart(response.data.cart)
        }catch(err){
            setError("Failed to remove product")
        }finally{
            setLoading(false)
        }
    }

    useEffect(() =>{
        const fetchCart = async () =>{
            setLoading(true)
            try{
                const response = await axiosInstance.get("cart/getCart")
                setCart(response.data)
            }catch(err){
                setError("Faliled to get cart")
            }finally{
                setLoading(false)
            }
        }

        fetchCart()
    }, [])

    if(loading){
        return <LoadingSpinner asOverlay/>
    }
    if(error){
        toast.error(error)
        return <p>{error}</p>
    }

  return (
    <div className='bg-gray-100 p-4'>
        {cart && cart.products.length > 0 ? (
            cart.products.map((productEnrty) =>(
                <CartProduct key={productEnrty.productId} product={productEnrty.productId} quantity={productEnrty.quantity} changeQuantity={changeQuantity} removeProduct={removeProduct}/>
            ))
        ):(<p>Your cart is empty</p>)}
    </div>
  )
}

export default Cart
