import React from 'react';

const Home = ({ products, setCart }) => {
  const addProductToCart = async (productId) => {
    const token = window.localStorage.getItem('token');
    if (!token) return;
    const response = await fetch(`/api/carts/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    const updatedCart = await response.json();
    return updatedCart;
  };

  return (
    <div>
      <h1>Home</h1>
      <h2>Products:</h2>
      {products.map((product) => (
        <div key={`products:${product.id}`}>
          {product.name}
          {''}
          <button
            onClick={async () => {
              const updatedCart = await addProductToCart(product.id);
              setCart(updatedCart);
            }}
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
};

export default Home;
