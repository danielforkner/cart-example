const client = require('./client');
const { getUserByToken, createUser, authenticate } = require('./User');
const { createCart } = require('./Cart');
const { createProduct } = require('./Product');
const { products } = require('./seedData');

const syncTables = async () => {
  const SQL = `
  DROP TABLE IF EXISTS cart_products;
  DROP TABLE IF EXISTS carts;
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS users;
  CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
  );
  CREATE TABLE products(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
  );
  CREATE TABLE carts(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    is_active BOOLEAN DEFAULT true
  );
  CREATE TABLE cart_products(
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id) NOT NULL,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    quantity INTEGER DEFAULT 1
  );
  `;
  await client.query(SQL);
};

const syncAndSeed = async () => {
  await syncTables();
  const [moe, lucy] = await Promise.all([
    createUser({
      username: 'moe',
      password: 'moe_password',
    }),
    createUser({
      username: 'lucy',
      password: 'lucy_password',
    }),
  ]);
  console.log('--- seeded users ---');
  const [moeCart, lucyCart] = await Promise.all([
    createCart({ userId: moe.id }),
    createCart({ userId: lucy.id }),
  ]);
  console.log('--- seeded carts ---');
  await Promise.all(products.map((product) => createProduct(product)));
  console.log('--- seeded products ---');
};

module.exports = {
  syncAndSeed,
  createUser,
  authenticate,
  getUserByToken,
  client,
};
