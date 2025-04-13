import React from 'react'

const cartProduct = props => {
  return (
    <div>
            <img src={props.imageUrl} alt="a" />
            <div>
                <h3>{props.title}</h3>
                <p>{props.price}</p>
                <p>{props.mrp}</p>
                <p>Seller: {props.seller}</p>
            </div>
    </div>
  )
}

export default cartProduct
