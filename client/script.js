// client/script.js - Telegram Dizayni uchun To'liq va Yakuniy Kod
const socket = io();

// DOM elementlarini aniqlash
const nickInput = document.getElementById("nickInput");
const roomInput = document.getElementById("roomInput");
const btnNick = document.getElementById("btnNick");
const btnJoin = document.getElementById("btnJoin");
const messagesEl = document.getElementById("messages");
const chatWrapEl = document.getElementById("chatWrap");
const form = document.getElementById("form");
const messageInput = document.getElementById("messageInput");
const btnSticker = document.getElementById("btnSticker");
const stickerPicker = document.getElementById("stickerPicker");
const activeRoomEl = document.getElementById("activeRoom");
const currentUserEl = document.getElementById("currentUser");
const currentRoomEl = document.getElementById("currentRoom");

let currentRoom = null;
let myNick = localStorage.getItem("chat_nick") || null;
if (myNick) {
    nickInput.value = myNick;
    currentUserEl.textContent = myNick;
}

function appendLine(html, isSelf = false) {
    const div = document.createElement("div"); // 'self' yoki 'other' klassini qo'shamiz
    div.className = "line " + (isSelf ? "self" : "other");
    div.innerHTML = html;
    messagesEl.appendChild(div); // Avtomatik pastga aylantirish (scroll)

    // Smooth scroll to bottom - scroll the parent container
    setTimeout(() => {
        if (chatWrapEl) {
            chatWrapEl.scrollTo({
                top: chatWrapEl.scrollHeight,
                behavior: "smooth",
            });
        }
    }, 0);
}

function sendCommand(cmdLine) {
    socket.emit("command", cmdLine);
}

function escapeHtml(s = "") {
    return s.replace(
        /[&<>"]/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
}

// UI event handlers

// Stiker Mantiqi
btnSticker.addEventListener("click", () => {
    const isHidden = stickerPicker.classList.contains("show") === false;
    if (isHidden) {
        stickerPicker.classList.add("show");
    } else {
        stickerPicker.classList.remove("show");
    }
    messageInput.focus();
});

stickerPicker.addEventListener("click", (e) => {
    if (e.target.classList.contains("sticker-item")) {
        const sticker = e.target.textContent.trim();
        messageInput.value += sticker;
        stickerPicker.classList.remove("show");
        messageInput.focus();
    }
});

document.addEventListener("click", (e) => {
    const isStickerButton = btnSticker.contains(e.target);
    const isStickerPicker = stickerPicker.contains(e.target);
    if (!isStickerButton && !isStickerPicker) {
        stickerPicker.classList.remove("show");
    }
});

// Asosiy event handlers
btnNick.addEventListener("click", () => {
    const name = nickInput.value.trim();
    if (!name) return alert("Enter nickname");
    myNick = name;
    localStorage.setItem("chat_nick", myNick);
    currentUserEl.textContent = myNick;
    sendCommand(`NICK ${name}`);
});

btnJoin.addEventListener("click", () => {
    const room = roomInput.value.trim();
    if (!room) return alert("Enter room name");
    currentRoom = room;
    activeRoomEl.textContent = room;
    currentRoomEl.textContent = room;
    sendCommand(`JOIN ${room}`);
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    if (currentRoom) {
        sendCommand(`MSG ${currentRoom} ${text}`);
        // Scroll to bottom when sending
        setTimeout(() => {
            if (chatWrapEl) {
                chatWrapEl.scrollTo({
                    top: chatWrapEl.scrollHeight,
                    behavior: "smooth",
                });
            }
        }, 50);
    } else {
        appendLine(`<span class="server">Join a room first (use JOIN)</span>`);
    }
    messageInput.value = "";
});

// socket events from server
socket.on("server-message", (msg) => {
    // Server xabarlari alohida "other" klassi bilan chiqadi
    appendLine(`<span class="server">[SERVER] ${escapeHtml(msg)}</span>`);
});

socket.on("room-message", (payload) => {
    // payload: { room, from, text }
    // Kim yuborganini tekshirish: isSelf
    const isSelf = payload.from === myNick;

    // Xabar mazmunini bubble ichiga joylashtiramiz
    let html = `
      <div class="message-meta">
        <span class="message-sender">${escapeHtml(payload.from)}</span>
      </div>
      <div class="message-bubble">
        <span class="text">${escapeHtml(payload.text)}</span>
      </div>
    `;
    appendLine(html, isSelf);
});

// optional: reconnect/connection notices
socket.on("connect", () =>
    appendLine('<span class="server">Connected to server</span>')
);
socket.on("disconnect", () =>
    appendLine('<span class="server">Disconnected from server</span>')
);
