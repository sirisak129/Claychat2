const express = require('express');
const app = express();
const http = require('http').createServer(app);

// 🛠️ แก้ไขตรงนี้: เพิ่ม maxHttpBufferSize เป็น 1e7 (ประมาณ 10MB) เพื่อให้รองรับการส่งรูปภาพไฟล์ใหญ่จากมือถือ
const io = require('socket.io')(http, {
    maxHttpBufferSize: 1e7 
});

// 🛠️ แก้ไขตรงนี้: เพิ่มบรรทัดนี้เข้าไปเพื่อให้ Express รู้จักและยอมส่งไฟล์ในโฟลเดอร์ public (index.html) ออกไป
app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    // 🎙️ เพิ่มโค้ดระบบ Voice Chat ฝั่ง Server (Signaling)
    socket.on('send_ice_candidate', (data) => {
        socket.to(data.target).emit('receive_ice_candidate', {
            sender: socket.id,
            candidate: data.candidate
        });
    });

    socket.on('send_offer_answer', (data) => {
        socket.to(data.target).emit('receive_offer_answer', {
            sender: socket.id,
            sdp: data.sdp,
            type: data.type
        });
    });
    // โค้ด join_world เดิมของคุณ...
    socket.on('join_world', (data) => {
        players[socket.id] = {
            id: socket.id,
            name: data.name,
            avatar: data.avatar,
            x: Math.floor(Math.random() * 600) + 100,
            y: Math.floor(Math.random() * 120) + 250
        };
        io.emit('current_players', players);
    });

    // 🛠️ เพิ่มโค้ดส่วนนี้เข้าไป: รับรูปจากคนส่ง แล้วกระจายไปให้ทุกคนในห้องเห็นทันที
    socket.on('share_image', (imgData) => {
        io.emit('new_image_share', {
            id: socket.id,
            image: imgData.image
        });
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('player_disconnected', socket.id);
    });
    
    // โค้ด player_move และ send_chat อื่นๆ ของคุณ...
    socket.on('player_move', (data) => { if(players[socket.id]) { players[socket.id].x = data.x; players[socket.id].y = data.y; socket.broadcast.emit('player_moved', players[socket.id]); } });
    socket.on('send_chat', (data) => { if(players[socket.id]) { io.emit('new_chat', { id: socket.id, name: players[socket.id].name, message: data.message }); } });
});

// 1. กำหนดพอร์ตแบบยืดหยุ่น
const port = process.env.PORT || 3000;

// 2. ใช้ตัวแปร port แทนเลข 3000
http.listen(port, () => {
    console.log(`Server running on port ${port}`);
});