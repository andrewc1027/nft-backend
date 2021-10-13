const jwt = require('jsonwebtoken');
const AuthFailed = require('./app/exceptions/AuthFailed');
const io = require('socket.io')({
  path: '/',
});
const JWT_SECRET = process.env.JWT_SECRET || 'putyourrandomstringhere';

console.log({status: 'IO Ready'});

io.use((socket, next) => {
  try {
    const payload = jwt.verify(socket.handshake.query.token, JWT_SECRET);
    socket.payload = payload;
    next();
  } catch (err) {
    console.log('socket auth failed!');
    next(new AuthFailed());
  }
}).on('connection', function(socket) {
  const employeeID = socket.payload.sub;
  socket.join(employeeID);
  io.to(employeeID).emit('hi!');
  console.log(employeeID + ' new connection');
});

module.exports = io;
