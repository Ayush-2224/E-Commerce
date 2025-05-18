import React from 'react'

const CartProduct = ({ product, changeQuantity, quantity, removeProduct }) => {
  // send quantity=0 to “remove”

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 grid grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-4">
      {/* Left: Image */}
      <div className="row-span-1">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-24 h-24 object-contain"
        />
      </div>

      {/* Right: Details (title, seller, price, offers, delivery) */}
      <div className="row-span-1 flex flex-col space-y-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500">
            Seller:{' '}
            <span className="font-medium">{product.seller.username}</span>
            <span className="inline-block align-middle ml-1 text-green-600">
              ✔️ Assured
            </span>
          </p>
        </div>

        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold text-gray-900">
            ₹{product.price}
          </div>
          <div className="text-sm line-through text-gray-400">
            ₹{product.mrp}
          </div>
        </div>

        <button className="text-sm text-blue-600 hover:underline self-start">
          7 offers available
        </button>

        <p className="text-sm text-gray-500">
          Delivery by Thu May 22 |{' '}
          <span className="font-medium">Free</span>
        </p>
      </div>

      {/* Bottom: Quantity and Actions spanning full width */}
      <div className="col-span-2 flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => changeQuantity(product._id, quantity - 1)}
            disabled={quantity <= 1}
            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
          >
            −
          </button>
          <span className="px-4 font-medium">{quantity}</span>
          <button
            onClick={() => changeQuantity(product._id, quantity + 1)}
            className="px-3 py-1 hover:bg-gray-100"
          >
            +
          </button>
        </div>

        <button
          onClick={() => removeProduct(product._id)}
          className="text-sm text-blue-600 hover:underline"
        >
          REMOVE
        </button>
      </div>
    </div>
  )
}

export default CartProduct
