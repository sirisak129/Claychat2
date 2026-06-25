const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// เพิ่มส่วนนี้เข้าไปครับ
app.use(express.static('public')); 
// ถ้ายังเข้าไม่ได้ ให้เพิ่ม route พื้นฐานนี้ด้วยครับ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
let players = {};
let boardPosts = []; // เก็บโพสต์ทั้งหมด

socket.on('update_board', (posts) => {
    boardPosts = posts;
    document.getElementById('boardContent').innerHTML = posts.map(p => `
        <div class="post-card">
            <span class="post-author">📌 ${p.author}</span>
            <div class="post-text">${p.text}</div>
            <div class="post-footer">
                <small>${new Date(p.timestamp).toLocaleTimeString()}</small>
                <button class="comment-btn" onclick="openComments(${p.id})">
                    💬 ${p.comments.length} คอมเมนต์
                </button>
            </div>
        </div>
    `).join('');
});

io.on('connection', (socket) => {
    // ส่งข้อมูลบอร์ดให้ผู้เล่นใหม่
    socket.emit('update_board', boardPosts);

    socket.on('create_post', (data) => {
        const newPost = {
            id: Date.now(),
            author: data.author,
            text: data.text,
            isPrivate: data.isPrivate,
            allowedUsers: data.allowedUsers,
            comments: [],
            timestamp: Date.now()
        };
        boardPosts.push(newPost);
        io.emit('update_board', boardPosts);
    });

    socket.on('add_comment', (data) => {
        const post = boardPosts.find(p => p.id === data.postId);
        if (post) {
            post.comments.push({ author: data.author, text: data.comment });
            io.emit('update_board', boardPosts);
        }
    });

    // ... ส่วนของ game logic อื่นๆ ของคุณ
});

// ตรวจสอบให้แน่ใจว่า port ถูกต้อง
http.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port ' + (process.env.PORT || 3000));
});
