const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
const {
  getCartByUserId,
  addProductToCart,
  deleteProductFromCart,
  purchaseCart,
} = require('./db/Cart');
const { getAllProducts } = require('./db/Product');
const { getUserByToken } = require('./db/User');

app.use('/dist', express.static(path.join(__dirname, '../dist')));
app.use('/static', express.static(path.join(__dirname, '../static')));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '../static/index.html'))
);

app.use('/api/auth', require('./api/auth'));

// app.post('/api/users/register', async (req, res) => {
//   const user = await createUser(req.body);
//   const cart = await createCart(user.id);
//   res.send({user, cart})
// })

app.get('/api/products', async (req, res) => {
  const products = await getAllProducts();
  res.send(products);
});

app.get('/api/carts/:userId', async (req, res) => {
  const { userId } = req.params;
  const cart = await getCartByUserId({ userId });
  res.send(cart);
});

app.post('/api/carts/', async (req, res) => {
  const user = await getUserByToken(req.headers.authorization);
  const cart = await getCartByUserId({ userId: user.id });
  const newCart = await purchaseCart({ cartId: cart.id, userId: user.id });
  res.send(newCart);
});

app.post('/api/carts/:productId', async (req, res) => {
  const { productId } = req.params;
  const user = await getUserByToken(req.headers.authorization);
  if (!user) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }
  const cart = await getCartByUserId({ userId: user.id });
  await addProductToCart({ cartId: cart.id, productId });
  const updatedCart = await getCartByUserId({ userId: user.id });
  res.send(updatedCart);
});

app.delete('/api/carts/:productId', async (req, res) => {
  const { productId } = req.params;
  const user = await getUserByToken(req.headers.authorization);
  if (!user) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }
  const cart = await getCartByUserId({ userId: user.id });
  await deleteProductFromCart({ cartId: cart.id, productId });
  const updatedCart = await getCartByUserId({ userId: user.id });
  res.send(updatedCart);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
