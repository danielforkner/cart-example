const client = require('./client');

// create cart
const createCart = async ({ userId }) => {
  const SQL = `
    INSERT INTO carts(user_id)
    VALUES($1) RETURNING *
  `;
  const response = await client.query(SQL, [userId]);
  return response.rows[0];
};

// get cart by user id
const getCartByUserId = async ({ userId }) => {
  const SQL = `
    SELECT * FROM carts
    WHERE user_id = $1 AND is_active = true;
  `;
  const response = await client.query(SQL, [userId]);
  const cart = response.rows[0];
  // get products, and attach to cart
  const productsSQL = `
  SELECT * FROM cart_products
  LEFT JOIN products ON cart_products.product_id = products.id
  WHERE cart_products.cart_id = $1
  `;
  const productsResponse = await client.query(productsSQL, [cart.id]);
  cart.products = productsResponse.rows;
  return cart;
};

// add product to cart
const addProductToCart = async ({ cartId, productId }) => {
  // check if product is already in cart
  const checkSQL = `
    SELECT * FROM cart_products
    WHERE cart_id = $1 AND product_id = $2
  `;
  const checkResponse = await client.query(checkSQL, [cartId, productId]);
  if (checkResponse.rows.length) {
    await client.query(
      `UPDATE cart_products SET quantity = quantity + 1 WHERE cart_id = $1 AND product_id = $2`,
      [cartId, productId]
    );
    return;
  }

  const SQL = `
    INSERT INTO cart_products(product_id, cart_id)
    VALUES($1, $2)
    RETURNING *
    `;
  await client.query(SQL, [productId, cartId]);
  return;
};

// remove product from cart
const deleteProductFromCart = async ({ cartId, productId }) => {
  const SQL = `
    DELETE FROM cart_products
    WHERE cart_id = $2 AND product_id = $1
  `;
  await client.query(SQL, [productId, cartId]);
  return;
};

// purchase cart
const purchaseCart = async ({ cartId, userId }) => {
  const SQL = `
  UPDATE carts
  SET is_active = false
  WHERE id = $1
  `;
  await client.query(SQL, [cartId]);
  const newCart = await createCart({ userId });
  return newCart;
};

module.exports = {
  createCart,
  getCartByUserId,
  addProductToCart,
  deleteProductFromCart,
  purchaseCart,
};
