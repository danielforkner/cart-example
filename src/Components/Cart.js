import React from 'react';

const Cart = ({ cart, setCart }) => {
  const deleteProductFromCart = async (productId) => {
    const token = window.localStorage.getItem('token');
    if (!token) return;
    const response = await fetch(`/api/carts/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    const updatedCart = await response.json();
    setCart(updatedCart);
    return updatedCart;
  };

  const purchaseCart = async () => {
    const token = window.localStorage.getItem('token');
    if (!token) return;
    const response = await fetch(`/api/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    const newCart = await response.json();
    setCart(newCart);
  };

  console.log('Cart: ', cart);
  return (
    <div>
      <h2>My products:</h2>
      <ul>
        {cart.products?.map((product) => {
          return (
            <li>
              {product.name}({product.quantity})
              <button
                onClick={async () => {
                  const updatedCart = await deleteProductFromCart(product.id);
                }}
              >
                DELETE PRODUCT
              </button>
            </li>
          );
        })}
      </ul>
      <button
        onClick={async () => {
          const newCart = await purchaseCart();
        }}
      >
        PURCHASE CART
      </button>
    </div>
  );
};

export default Cart;
