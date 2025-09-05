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
  res.status(200).json({ exists: !!user, user: user });
});

server.post('/reset-password', (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'Thiếu phone hoặc mật khẩu mới' });
  }

  const user = server.db.get('users').find({ id }).value();

  if (!user) {
    return res
      .status(404)
      .json({ error: 'Không tìm thấy người dùng với số điện thoại này' });
  }

  // Cập nhật mật khẩu
  server.db
    .get('users')
    .find({ id: id })
    .assign({ password: password })
    .write();

  return res.status(200).json({ success: true });
});

// Auth & routes
server.use(jsonServerAuth);
server.use(router);

server.listen(3001, () => {
  console.log('JSON Server is running on port 3001');
});
