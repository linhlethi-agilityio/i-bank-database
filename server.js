const jsonServer = require('json-server');
const jsonServerAuth = require('json-server-auth');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const bcrypt = require('bcryptjs');

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
  res.status(200).json({ exists: !!user, user: user });
});

server.use(jsonServer.bodyParser);

server.post('/reset-password', async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'Missing id or new password' });
  }

  const userId = Number(id);
  const user = server.db.get('users').find({ id: userId }).value();

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  server.db
    .get('users')
    .find({ id: userId })
    .assign({ password: hashedPassword })
    .write();

  return res.status(200).json({ success: true });
});

// Auth & routes
server.use(jsonServerAuth);
server.use(router);

server.listen(3001, () => {
  console.log('JSON Server is running on port 3001');
});
