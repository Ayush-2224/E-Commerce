import React, { useState } from 'react';
import { axiosInstance } from '../../lib/axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUserAuthStore } from '../../store/userAuth.store';
const ProductImageGallery = ({ images , productId }) => {
  const [selectedImage, setSelectedImage] = useState(images?.[0]);
  const [check, setCheck] = useState(false);
  const authUser = useUserAuthStore((state) => state.authUser);
  const isLoggedIn = !!authUser;
  const navigate = useNavigate();
    const addtoCartHandler = async () => {
        if(!isLoggedIn && !check){
          const items = JSON.parse(localStorage.getItem("cartItems"));
          items.push({ id: productId, qty: 1 });
          localStorage.setItem("cartItems", JSON.stringify(items));
          setCheck(true);
          toast.success("Product added to cart");
          return;
        }
        if(check === true){
            navigate("/cart");
            return;
        }
        try{
            const response = await axiosInstance.post(`cart/add/${productId}`, { quantity: 1 });
            if(response.status === 200){
                toast.success("Product added to cart");
                setCheck(true);
            }
        }catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to add product to cart";
            toast.error(errorMessage);
        }
    }


    const buyNowHandler = async () => {
        if(!isLoggedIn){
          navigate("/user/login");
          return
        }
        navigate(`/buy/${productId}`);
    }

    useEffect(() => {
        const checkProductInCart = async () => {
          if(!isLoggedIn){
            const items = JSON.parse(localStorage.getItem("cartItems")) || [];
            const productExists = items.some(item => item.id === productId);
            setCheck(productExists);
            return;
        }
        try{
            const response = await axiosInstance.get(`cart/check/${productId}`);
            if(response.status === 200){
                setCheck(true);
            }
        }catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to check product in cart";
            toast.error(errorMessage);
        }
    }

    checkProductInCart();
    }, [check]);
  return (
    <div className="flex flex-col-reverse md:flex-row gap-6">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-3 w-full  space-y-2 mr-4 md:w-24">
        {images?.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index}`}
            onClick={() => setSelectedImage(img)}
            className={`w-16 h-20 border cursor-pointer object-contain ${
              img === selectedImage ? 'border-blue-500' : 'border-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="flex flex-col items-center">
   <div className="h-96 w-[380px] border border-gray-100 rounded p-5 flex items-center justify-center bg-white">
    <img
      src={selectedImage}
      alt="Selected product"
      className="max-h-full max-w-full object-contain"
    />
  </div>
  <div className="flex gap-3 mt-4 justify-center">
    <button className="flex items-center gap-2 md:px-6 px-2 py-2 bg-[#ffa41c] text-white font-semibold cursor-pointer hover:bg-[#e68f17] rounded"
    onClick={addtoCartHandler}>
       <svg className="inline" width="16" height="16" viewBox="0 0 16 15" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.32 2.405H4.887C3 2.405 2.46.805 2.46.805L2.257.21C2.208.085 2.083 0 1.946 0H.336C.1 0-.064.24.024.46l.644 1.945L3.11 9.767c.047.137.175.23.32.23h8.418l-.493 1.958H3.768l.002.003c-.017 0-.033-.003-.05-.003-1.06 0-1.92.86-1.92 1.92s.86 1.92 1.92 1.92c.99 0 1.805-.75 1.91-1.712l5.55.076c.12.922.91 1.636 1.867 1.636 1.04 0 1.885-.844 1.885-1.885 0-.866-.584-1.593-1.38-1.814l2.423-8.832c.12-.433-.206-.86-.655-.86" fill="#fff" />
                            </svg>
      {check === false ? "ADD TO CART": "GO TO CART"}
    </button>
    <button className="flex items-center gap-2 md:px-6 px-2 py-2 bg-[#ff6200] text-white font-semibold cursor-pointer hover:bg-[#e05500] rounded"
    onClick={buyNowHandler}>
    <svg className="inline" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" />
                            </svg>
                            
      BUY NOW
    </button>
  </div>
</div>

      
    </div>
  );
};

export default ProductImageGallery;
