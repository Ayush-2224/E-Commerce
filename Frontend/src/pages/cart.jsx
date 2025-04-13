import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../lib/axios'

const cart = () => {
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(false)
    const[error, setError] = useState(null)
    useEffect(() =>{
        const fetchCart = async () =>{
            setLoading(true)
            try{
                const response = await axiosInstance.get("/getCart")
                setCart(response.data.cart)
            }
        }
    })

  return (
    <div>
        
    </div>
  )
}

export default cart
