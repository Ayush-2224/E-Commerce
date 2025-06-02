import React from 'react';
import { Link } from 'react-router-dom';

const ProductShow = React.forwardRef(({ product }, ref) => {
  const containerProps = {
    className:
      'bg-white rounded-xl shadow-sm p-4 mb-6 grid grid-cols-[auto_1fr] gap-4',
    ...(ref ? { ref } : {}), // Only add ref if it's passed
  };

  return (
    <div {...containerProps}>
      <div>
        <Link to={`/product/${product._id}`}>
          <img
            src={product.imageUrl[0]}
            alt={product.title}
            className="w-24 h-24 object-contain"
          />
        </Link>
      </div>

      <div className="space-y-2">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
            {product.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500">
          Seller:{' '}
          <span className="font-medium">{product.seller?.username}</span>{' '}
          <span className="text-green-600">✔️ Assured</span>
        </p>
        <div className="inline-flex text-xs items-center font-medium bg-green-600 text-white px-2 py-1 rounded">
          {product.rating.toFixed(1)}
          <span className="ml-1">☆</span>
        </div>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold text-gray-900">₹{product.price}</div>
          <div className="text-sm line-through text-gray-400">₹{product.mrp}</div>
        </div>
      </div>
    </div>
  );
});

export default ProductShow;
