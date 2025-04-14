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
            const response = await axiosInstance.patch(`/modifyQty/${productId}`, {quantity})
            setCart(response.data.cart)
        }catch(err){
            setError("Failed to change quantity")
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
    <div>
        {cart && cart.products.length > 0 ? (
            cart.products.map((productEnrty) =>(
                <CartProduct key={productEnrty.productId} product={productEnrty.productId} changeQuantity={changeQuantity}/>
            ))
        ):(<p>Your cart is empty</p>)}
    </div>
  )
}

export default Cart
