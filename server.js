const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let players = {};
let boardPosts = []; // เก็บโพสต์ทั้งหมด

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

http.listen(process.env.PORT || 3000, () => {
    console.log('Server is running...');
});
