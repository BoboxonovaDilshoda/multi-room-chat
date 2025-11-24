// client/script.js - Telegram Dizayni uchun To'liq va Yakuniy Kod
const socket = io(); 

// DOM elementlarini aniqlash
const nickInput = document.getElementById('nickInput');
const roomInput = document.getElementById('roomInput');
const btnNick = document.getElementById('btnNick');
const btnJoin = document.getElementById('btnJoin');
const messagesEl = document.getElementById('messages');
const form = document.getElementById('form');
const messageInput = document.getElementById('messageInput');
const btnSticker = document.getElementById('btnSticker');
const stickerPicker = document.getElementById('stickerPicker'); 

let currentRoom = null;
let myNick = localStorage.getItem('chat_nick') || null;
if (myNick) nickInput.value = myNick;


function appendLine(html, isSelf = false) {
    const div = document.createElement('div');
    // 'self' yoki 'other' klassini qo'shamiz
    div.className = 'line ' + (isSelf ? 'self' : 'other'); 
    div.innerHTML = html;
    messagesEl.appendChild(div);
    // Avtomatik pastga aylantirish (scroll)
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function sendCommand(cmdLine) {
    socket.emit('command', cmdLine);
}

function escapeHtml(s = '') {
    return s.replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]);
}

// UI event handlers

// Stiker Mantiqi 
btnSticker.addEventListener('click', () => {
    const isHidden = stickerPicker.style.display === 'none' || stickerPicker.style.display === '';
    stickerPicker.style.display = isHidden ? 'flex' : 'none';
    messageInput.focus();
});

stickerPicker.addEventListener('click', (e) => {
    if (e.target.classList.contains('sticker-item')) {
        const sticker = e.target.textContent.trim();
        messageInput.value += sticker;
        stickerPicker.style.display = 'none'; 
        messageInput.focus();
    }
});

document.addEventListener('click', (e) => {
    const isStickerButton = btnSticker.contains(e.target);
    const isStickerPicker = stickerPicker.contains(e.target);
    if (!isStickerButton && !isStickerPicker) {
        stickerPicker.style.display = 'none';
    }
});

// Asosiy event handlers
btnNick.addEventListener('click', () => {
    const name = nickInput.value.trim();
    if (!name) return alert('Enter nickname');
    myNick = name;
    localStorage.setItem('chat_nick', myNick);
    sendCommand(`NICK ${name}`);
});

btnJoin.addEventListener('click', () => {
    const room = roomInput.value.trim();
    if (!room) return alert('Enter room name');
    currentRoom = room;
    sendCommand(`JOIN ${room}`);
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    if (currentRoom) {
        sendCommand(`MSG ${currentRoom} ${text}`);
    } else {
        appendLine(`<span class="server">Join a room first (use JOIN)</span>`);
    }
    messageInput.value = '';
});

// socket events from server
socket.on('server-message', (msg) => {
    // Server xabarlari alohida "other" klassi bilan chiqadi
    appendLine(`<span class="server">[SERVER] ${escapeHtml(msg)}</span>`);
});

socket.on('room-message', (payload) => {
    // payload: { room, from, text }
    
    // Kim yuborganini tekshirish: isSelf
    const isSelf = payload.from === myNick; 

    // Xabar mazmunini bubble ichiga joylashtiramiz
    let content = ``;
    
    if (!isSelf) {
        content = `<strong>${escapeHtml(payload.from)}</strong><br>${escapeHtml(payload.text)}`;
    } else {
        content = escapeHtml(payload.text);
    }
    
    const html = `<div class="message-bubble">${content}</div>`;
    
    appendLine(html, isSelf); 
});

// optional: reconnect/connection notices
socket.on('connect', () => appendLine('<span class="server">Connected to server</span>'));
socket.on('disconnect', () => appendLine('<span class="server">Disconnected from server</span>'));