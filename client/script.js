// client/script.js - Multi-Room Chat Client (Homework 3)
// Team:
//   Sharifova Durdona Uchkun Kizi (24013572)
//   Bobokhonova Dilshoda (23013076)
//   Tillabaev Yosinbek (25013516)
//   Olimjonov Hojiakbar (23012976)
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
const themeToggle = document.getElementById("themeToggle");
const savedRoomsList = document.getElementById("savedRoomsList");
const clearRoomsBtn = document.getElementById("clearRooms");
const clearNickBtn = document.getElementById("clearNick");

let currentRoom = null;
let myNick = localStorage.getItem("chat_nick") || null;
if (myNick) {
    nickInput.value = myNick;
    currentUserEl.textContent = myNick;
}

// ============ SAVED ROOMS FUNCTIONALITY ============
function getSavedRooms() {
    try {
        return JSON.parse(localStorage.getItem("chat_rooms") || "[]");
    } catch {
        return [];
    }
}

function saveRoom(roomName) {
    if (!roomName) return;
    
    let rooms = getSavedRooms();
    
    // Remove if exists (to update timestamp)
    rooms = rooms.filter(r => r.name !== roomName);
    
    // Add to beginning
    rooms.unshift({
        name: roomName,
        joinedAt: Date.now()
    });
    
    // Keep only last 10 rooms
    rooms = rooms.slice(0, 10);
    
    localStorage.setItem("chat_rooms", JSON.stringify(rooms));
    renderSavedRooms();
}

function deleteRoom(roomName) {
    let rooms = getSavedRooms();
    rooms = rooms.filter(r => r.name !== roomName);
    localStorage.setItem("chat_rooms", JSON.stringify(rooms));
    renderSavedRooms();
}

function clearAllRooms() {
    localStorage.removeItem("chat_rooms");
    renderSavedRooms();
}

function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

function renderSavedRooms() {
    const rooms = getSavedRooms();
    
    if (rooms.length === 0) {
        savedRoomsList.innerHTML = '<p class="empty-text">No saved rooms</p>';
        return;
    }
    
    savedRoomsList.innerHTML = rooms.map(room => `
        <div class="saved-room-item ${currentRoom === room.name ? 'active' : ''}" data-room="${escapeHtml(room.name)}">
            <div class="saved-room-icon">${room.name.charAt(0)}</div>
            <div class="saved-room-info">
                <div class="saved-room-name">${escapeHtml(room.name)}</div>
                <div class="saved-room-time">${formatTimeAgo(room.joinedAt)}</div>
            </div>
            <button class="saved-room-delete" data-delete="${escapeHtml(room.name)}" title="Remove">✕</button>
        </div>
    `).join('');
}

// Click handlers for saved rooms
savedRoomsList.addEventListener("click", (e) => {
    // Handle delete button
    const deleteBtn = e.target.closest(".saved-room-delete");
    if (deleteBtn) {
        e.stopPropagation();
        const roomName = deleteBtn.dataset.delete;
        deleteRoom(roomName);
        return;
    }
    
    // Handle room item click (join room)
    const roomItem = e.target.closest(".saved-room-item");
    if (roomItem) {
        const roomName = roomItem.dataset.room;
        roomInput.value = roomName;
        joinRoom(roomName);
    }
});

// Clear all rooms button
clearRoomsBtn.addEventListener("click", () => {
    if (confirm("Clear all saved rooms?")) {
        clearAllRooms();
    }
});

// Initialize saved rooms on load
renderSavedRooms();

// Theme toggle functionality
const isDarkMode = localStorage.getItem("darkMode") === "true";
if (isDarkMode) {
    document.documentElement.classList.add("dark-mode");
    updateThemeIcon();
}

themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark-mode");
    const isNowDark = document.documentElement.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isNowDark);
    updateThemeIcon();
});

function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains("dark-mode");
    themeToggle.innerHTML = isDark ? "☀️" : "🌙";
}

// Store for user's reactions per message
const myReactions = new Map(); // msgId -> emoji

function appendLine(html, isSelf = false, msgId = null) {
    const div = document.createElement("div");
    div.className = "line " + (isSelf ? "self" : "other");
    if (msgId) div.dataset.msgId = msgId;
    div.innerHTML = html;
    messagesEl.appendChild(div);

    // Smooth scroll to bottom
    setTimeout(() => {
        if (chatWrapEl) {
            chatWrapEl.scrollTo({
                top: chatWrapEl.scrollHeight,
                behavior: "smooth",
            });
        }
    }, 0);
    
    return div;
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

// Clear nickname
clearNickBtn.addEventListener("click", () => {
    nickInput.value = "";
    myNick = null;
    localStorage.removeItem("chat_nick");
    currentUserEl.textContent = "Guest";
    nickInput.focus();
});

// Join room function (reusable)
function joinRoom(roomName) {
    if (!roomName) return;
    currentRoom = roomName;
    activeRoomEl.textContent = roomName;
    currentRoomEl.textContent = roomName;
    sendCommand(`JOIN ${roomName}`);
    saveRoom(roomName);
    renderSavedRooms(); // Update active state
}

btnJoin.addEventListener("click", () => {
    const room = roomInput.value.trim();
    if (!room) return alert("Enter room name");
    joinRoom(room);
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    if (currentRoom) {
        // If replying, format the message with reply context (include quoted text)
        let messageToSend = text;
        if (replyingTo) {
            // Format: [REPLY:author:quotedText]actualMessage
            const quotedText = replyingTo.text.substring(0, 100);
            messageToSend = `[REPLY:${replyingTo.author}:${quotedText}]${text}`;
        }
        sendCommand(`MSG ${currentRoom} ${messageToSend}`);
        
        // Clear reply state
        replyingTo = null;
        const replyPreview = document.querySelector(".reply-preview");
        if (replyPreview) replyPreview.remove();
        
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

// Store for reply context
let replyingTo = null;

// Parse reply format from message
function parseReplyMessage(text) {
    // Format: [REPLY:author:quotedText]actualMessage
    const replyMatch = text.match(/^\[REPLY:([^:]+):([^\]]*)\](.*)$/s);
    if (replyMatch) {
        return {
            isReply: true,
            replyAuthor: replyMatch[1],
            replyText: replyMatch[2],
            actualText: replyMatch[3]
        };
    }
    return {
        isReply: false,
        actualText: text
    };
}

socket.on("room-message", (payload) => {
    // payload: { room, from, text, msgId }
    const isSelf = payload.from === myNick;
    
    // Generate timestamp
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Parse for reply
    const parsed = parseReplyMessage(payload.text);
    
    // Build reply quote HTML if this is a reply
    let replyQuoteHtml = '';
    if (parsed.isReply) {
        const truncatedQuote = parsed.replyText.length > 60 
            ? parsed.replyText.substring(0, 60) + '...' 
            : parsed.replyText;
        replyQuoteHtml = `
          <div class="reply-quote">
            <span class="reply-quote-author">${escapeHtml(parsed.replyAuthor)}</span>
            <span class="reply-quote-text">${escapeHtml(truncatedQuote)}</span>
          </div>
        `;
    }

    let html = `
      <div class="message-meta">
        <span class="message-sender">${escapeHtml(payload.from)}</span>
        <span class="message-time">${timeStr}</span>
      </div>
      <div class="message-content-wrapper">
        <div class="message-actions">
          <button class="message-action-btn" title="React" data-action="react">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>
          <button class="message-action-btn" title="Reply" data-action="reply">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 17 4 12 9 7"/>
              <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
            </svg>
          </button>
          <button class="message-action-btn" title="Copy" data-action="copy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
        <div class="message-bubble">
          ${replyQuoteHtml}
          <span class="text">${escapeHtml(parsed.actualText)}</span>
        </div>
        <div class="message-reactions"></div>
      </div>
    `;
    appendLine(html, isSelf, payload.msgId);
});

// Handle reaction updates from server
socket.on("reaction-update", (data) => {
    // data: { msgId, reactions: { emoji: count }, userReaction, oderId }
    const msgEl = document.querySelector(`[data-msg-id="${data.msgId}"]`);
    if (!msgEl) return;
    
    const reactionsEl = msgEl.querySelector(".message-reactions");
    if (!reactionsEl) return;
    
    // Update my reaction tracking if this update is for me
    if (data.oderId === socket.id) {
        if (data.userReaction) {
            myReactions.set(data.msgId, data.userReaction);
        } else {
            myReactions.delete(data.msgId);
        }
    }
    
    // Clear and rebuild reactions
    reactionsEl.innerHTML = '';
    
    const myCurrentReaction = myReactions.get(data.msgId);
    
    for (const [emoji, count] of Object.entries(data.reactions)) {
        const reactionSpan = document.createElement("span");
        reactionSpan.className = "reaction-item";
        if (emoji === myCurrentReaction) {
            reactionSpan.classList.add("my-reaction");
        }
        reactionSpan.dataset.emoji = emoji;
        reactionSpan.dataset.msgId = data.msgId;
        reactionSpan.innerHTML = `${emoji}<span class="reaction-count">${count}</span>`;
        reactionsEl.appendChild(reactionSpan);
    }
});

// optional: reconnect/connection notices
socket.on("connect", () =>
    appendLine('<span class="server">Connected to server</span>')
);
socket.on("disconnect", () =>
    appendLine('<span class="server">Disconnected from server</span>')
);

// Message action handlers
messagesEl.addEventListener("click", (e) => {
    const actionBtn = e.target.closest(".message-action-btn");
    if (!actionBtn) return;
    
    const action = actionBtn.dataset.action;
    const messageLine = actionBtn.closest(".line");
    // Get only the actual message text (not the reply quote)
    const messageTextEl = messageLine.querySelector(".message-bubble > .text");
    const messageText = messageTextEl?.textContent || "";
    const senderName = messageLine.querySelector(".message-sender")?.textContent || "";
    
    switch (action) {
        case "copy":
            navigator.clipboard.writeText(messageText).then(() => {
                // Visual feedback
                actionBtn.style.color = "var(--primary-color)";
                setTimeout(() => {
                    actionBtn.style.color = "";
                }, 1000);
            });
            break;
        case "reply":
            setReplyTo(senderName, messageText);
            break;
        case "react":
            showQuickReaction(messageLine);
            break;
    }
});

// Reply functionality
function setReplyTo(author, text) {
    replyingTo = { author, text };
    
    // Remove existing reply preview
    const existingPreview = document.querySelector(".reply-preview");
    if (existingPreview) existingPreview.remove();
    
    // Create reply preview above input
    const preview = document.createElement("div");
    preview.className = "reply-preview";
    preview.innerHTML = `
        <div class="reply-preview-content">
            <span class="reply-preview-author">Replying to ${escapeHtml(author)}</span>
            <span class="reply-preview-text">${escapeHtml(text.substring(0, 50))}${text.length > 50 ? '...' : ''}</span>
        </div>
        <button class="reply-preview-close" type="button">✕</button>
    `;
    
    const messageForm = document.querySelector(".message-form");
    messageForm.insertBefore(preview, messageForm.firstChild);
    
    // Close button
    preview.querySelector(".reply-preview-close").addEventListener("click", () => {
        replyingTo = null;
        preview.remove();
    });
    
    messageInput.focus();
}

// Quick reaction popup
function showQuickReaction(messageLine) {
    const msgId = messageLine.dataset.msgId;
    
    // Remove existing reaction picker if any
    const existing = document.querySelector(".quick-reaction-picker");
    if (existing) existing.remove();
    
    const picker = document.createElement("div");
    picker.className = "quick-reaction-picker";
    picker.innerHTML = `
        <span class="quick-react" data-emoji="👍">👍</span>
        <span class="quick-react" data-emoji="❤️">❤️</span>
        <span class="quick-react" data-emoji="😂">😂</span>
        <span class="quick-react" data-emoji="😮">😮</span>
        <span class="quick-react" data-emoji="😢">😢</span>
    `;
    
    // Append to content wrapper
    const wrapper = messageLine.querySelector(".message-content-wrapper");
    wrapper.appendChild(picker);
    
    picker.addEventListener("click", (e) => {
        if (e.target.classList.contains("quick-react")) {
            const emoji = e.target.dataset.emoji;
            
            if (msgId) {
                // Send reaction to server for sync
                sendCommand(`REACT ${msgId} ${emoji}`);
            } else {
                // Local-only reaction (server not updated)
                addLocalReaction(wrapper, emoji);
            }
            picker.remove();
        }
    });
    
    // Auto close after 3 seconds
    setTimeout(() => {
        if (picker.parentNode) picker.remove();
    }, 3000);
    
    // Close when clicking elsewhere
    setTimeout(() => {
        document.addEventListener("click", function closeReaction(e) {
            if (!picker.contains(e.target) && !e.target.closest(".message-action-btn")) {
                if (picker.parentNode) picker.remove();
                document.removeEventListener("click", closeReaction);
            }
        });
    }, 100);
}

// Add local reaction (when server doesn't have msgId support)
function addLocalReaction(wrapper, emoji) {
    let reactionsEl = wrapper.querySelector(".message-reactions");
    if (!reactionsEl) {
        reactionsEl = document.createElement("div");
        reactionsEl.className = "message-reactions";
        wrapper.appendChild(reactionsEl);
    }
    
    // Get current user's reaction if any
    const myCurrentReaction = reactionsEl.querySelector(".my-reaction");
    
    // If clicking same emoji, remove it
    if (myCurrentReaction && myCurrentReaction.dataset.emoji === emoji) {
        const countEl = myCurrentReaction.querySelector(".reaction-count");
        const count = parseInt(countEl.textContent) - 1;
        if (count <= 0) {
            myCurrentReaction.remove();
        } else {
            countEl.textContent = count;
            myCurrentReaction.classList.remove("my-reaction");
        }
        return;
    }
    
    // Remove old reaction if exists
    if (myCurrentReaction) {
        const countEl = myCurrentReaction.querySelector(".reaction-count");
        const count = parseInt(countEl.textContent) - 1;
        if (count <= 0) {
            myCurrentReaction.remove();
        } else {
            countEl.textContent = count;
            myCurrentReaction.classList.remove("my-reaction");
        }
    }
    
    // Add new reaction
    const existingReaction = reactionsEl.querySelector(`[data-emoji="${emoji}"]`);
    if (existingReaction) {
        const countEl = existingReaction.querySelector(".reaction-count");
        countEl.textContent = parseInt(countEl.textContent) + 1;
        existingReaction.classList.add("my-reaction");
    } else {
        const reactionSpan = document.createElement("span");
        reactionSpan.className = "reaction-item my-reaction";
        reactionSpan.dataset.emoji = emoji;
        reactionSpan.innerHTML = `${emoji}<span class="reaction-count">1</span>`;
        reactionsEl.appendChild(reactionSpan);
    }
}

// Click on existing reaction to toggle
messagesEl.addEventListener("click", (e) => {
    const reactionItem = e.target.closest(".reaction-item");
    if (reactionItem) {
        const msgId = reactionItem.dataset.msgId;
        const emoji = reactionItem.dataset.emoji;
        
        if (msgId && emoji) {
            // Send reaction (server will toggle if same emoji)
            sendCommand(`REACT ${msgId} ${emoji}`);
        } else if (emoji) {
            // Local toggle
            const wrapper = reactionItem.closest(".message-content-wrapper");
            addLocalReaction(wrapper, emoji);
        }
    }
});
