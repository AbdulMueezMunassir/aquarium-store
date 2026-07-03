const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

connectDB();

app.use(cors({
    origin: "http://localhost:4200",
    credentials: true
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/fish', require('./routes/fish'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'))

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join_room', (userId) => {
        socket.join(userId);
    });
    
    socket.on('send_message', (data) => {
        io.to(data.recipientId).emit('receive_message', data);
    });
    
    socket.on('new_order', (orderData) => {
        io.emit('admin_notification', orderData);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.set('socketio', io);

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('Server started on port ' + PORT));