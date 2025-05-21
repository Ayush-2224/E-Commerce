import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../lib/axios';
import LoadingSpinner from "../components/UIElements/LoadingSpinner";
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import DeliveryInfo from '../components/UIElements/DelieryInfo';
const Product = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true)
            setError(null);
            try {
                const response = await axiosInstance.get(`product/getProduct/${productId}`);
                console.log(response);
                setProduct(response.data);
            } catch (err) {
                const errorMessage = err.response?.data?.message || "";
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [productId])

    if (loading || !product) {
        return <LoadingSpinner asOverlay />;
    }



    return (
        <div>

        <div className='bg-gray-100 p-4 min-h-screen'>

            {error && <p className="text-red-500 text-center pb-4">{error}</p>} {/* Show operational errors */}
            <div>
                <div>
                    <div></div>
                    <div></div>

                </div>
                <div></div>
            </div>
            <div>
                <div>{product.title}</div>
                <div>{product.rating}</div>
                    <div>Extra {product.mrp - product.price} off</div>
                <div className="flex items-baseline space-x-2">
                    <div className="text-2xl font-bold text-gray-900">
                        ₹{product.price}
                    </div>
                    <div className="text-sm line-through text-gray-400">
                        ₹{product.mrp}
                    </div>
                </div>
                    <DeliveryInfo />
                <div>
                    <p></p>
                </div>
            </div>

        </div>

        <div>
            Similar Products
        </div>
        </div>
    );
};

export default Product;