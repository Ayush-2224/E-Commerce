import React from 'react'

const CartProduct = ({ product, changeQuantity }) => {
    console.log(product)
  return (
    <div>
      <img src={product.imageUrl} alt={product.title} width="100" />
      <div>
        <h3>{product.title}</h3>
        <p>Price: ₹{product.price}</p>
        <p>MRP: ₹{product.mrp}</p>
        <p>Seller: {product.seller.username}</p>
        <div>
          <button onClick={() => changeQuantity(product.productId, product.quantity - 1)} disabled={product.quantity <= 1}>-</button>
          <span style={{ margin: "0 10px" }}>{product.quantity}</span>
          <button onClick={() => changeQuantity(product.productId, product.quantity + 1)}>+</button>
        </div>
      </div>
    </div>
  )
}

export default CartProduct
