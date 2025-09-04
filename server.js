const jsonServer = require('json-server');
const jsonServerAuth = require('json-server-auth');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.db = router.db;

// rules cho user CRUD
const rules = jsonServerAuth.rewriter({
  users: 640,
});
server.use(rules);

// Custom endpoint: check phone tồn tại (public)
server.get('/exists/phone/:phone', (req, res) => {
  const phone = req.params.phone;
  const user = server.db.get('users').find({ phone }).value();
  res.status(200).json({ exists: !!user });
});

// Auth & routes
server.use(jsonServerAuth);
server.use(router);

server.listen(3001, () => {
  console.log('JSON Server is running on port 3001');
});
