// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

// serve client folder
const clientDir = path.join(__dirname, 'client');
app.use(express.static(clientDir));

// simple health
app.get('/health', (req, res) => res.send('ok'));

// create server + socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // productionda originni cheklang
});

// in-memory store
const clients = new Map();
const messageReactions = new Map(); // messageId -> { oderId: emoji }

const MAX_MSG_LEN = 1000;
let messageIdCounter = 0;

io.on('connection', socket => {
  const defaultNick = `user-${socket.id.slice(0,4)}`;
  clients.set(socket.id, { nick: defaultNick, room: null });
  console.log(`[CONN] ${socket.id} (${defaultNick})`);
  socket.emit('server-message', `Welcome ${defaultNick}. Use NICK, JOIN, MSG.`);

  socket.on('command', (line='') => {
    try { handleCommand(socket, String(line)); }
    catch (err) {
      console.error('handleCommand error', err);
      socket.emit('server-message', 'Server error handling command');
    }
  });

  socket.on('disconnect', () => {
    const info = clients.get(socket.id);
    if (info) {
      if (info.room) io.to(info.room).emit('server-message', `${info.nick} left ${info.room}`);
      console.log(`[DISCONN] ${socket.id} (${info.nick})`);
    } else {
      console.log(`[DISCONN] ${socket.id}`);
    }
    clients.delete(socket.id);
  });
});

function handleCommand(socket, line) {
  const trimmed = line.trim();
  if (!trimmed) return;
  const [c, ...rest] = trimmed.split(/\s+/);
  const cmd = (c || '').toUpperCase();
  const info = clients.get(socket.id) || { nick: `user-${socket.id.slice(0,4)}`, room: null };

  if (cmd === 'NICK') {
    const newNick = rest.join(' ').trim();
    if (!newNick) return socket.emit('server-message', 'Usage: NICK <nickname>');
    const old = info.nick;
    info.nick = newNick.slice(0,32);
    clients.set(socket.id, info);
    socket.emit('server-message', `Nickname set to ${info.nick}`);
    console.log(`[NICK] ${old} -> ${info.nick}`);
    return;
  }

  if (cmd === 'JOIN') {
    const room = (rest[0] || '').trim();
    if (!room) return socket.emit('server-message', 'Usage: JOIN <room>');
    if (info.room) {
      socket.leave(info.room);
      io.to(info.room).emit('server-message', `${info.nick} left ${info.room}`);
    }
    socket.join(room);
    info.room = room;
    clients.set(socket.id, info);
    socket.emit('server-message', `Joined ${room}`);
    io.to(room).emit('server-message', `${info.nick} joined ${room}`);
    console.log(`[JOIN] ${info.nick} -> ${room}`);
    return;
  }

  if (cmd === 'MSG') {
    const room = rest[0];
    const text = rest.slice(1).join(' ').trim();
    if (!room || !text) return socket.emit('server-message', 'Usage: MSG <room> <message>');
    if (info.room !== room) return socket.emit('server-message', `You are not in ${room}. JOIN first.`);
    if (text.length > MAX_MSG_LEN) return socket.emit('server-message', `Message too long (max ${MAX_MSG_LEN})`);
    
    // Generate unique message ID
    const msgId = `${Date.now()}-${++messageIdCounter}`;
    messageReactions.set(msgId, new Map());
    
    const payload = { room, from: info.nick, text, msgId };
    io.to(room).emit('room-message', payload);
    console.log(`[MSG] [${room}] ${info.nick}: ${text}`);
    return;
  }

  if (cmd === 'REACT') {
    // Format: REACT <msgId> <emoji> or REACT <msgId> (to remove)
    const msgId = rest[0];
    const emoji = rest[1] || null;
    
    if (!msgId) return socket.emit('server-message', 'Usage: REACT <msgId> <emoji>');
    if (!info.room) return socket.emit('server-message', 'Join a room first');
    
    let reactions = messageReactions.get(msgId);
    if (!reactions) {
      reactions = new Map();
      messageReactions.set(msgId, reactions);
    }
    
    const oderId = socket.id;
    const currentEmoji = reactions.get(oderId);
    
    if (emoji && currentEmoji === emoji) {
      // Same emoji clicked - remove reaction
      reactions.delete(oderId);
    } else if (emoji) {
      // New or different emoji - set/replace reaction
      reactions.set(oderId, emoji);
    } else {
      // No emoji provided - remove reaction
      reactions.delete(oderId);
    }
    
    // Build reactions summary: { emoji: count }
    const summary = {};
    for (const [, e] of reactions) {
      summary[e] = (summary[e] || 0) + 1;
    }
    
    // Broadcast updated reactions to room
    io.to(info.room).emit('reaction-update', { 
      msgId, 
      reactions: summary,
      userReaction: reactions.get(oderId) || null,
      oderId
    });
    
    return;
  }
  //Yopngi WHOIS buyrug'i qo'shildi
  if (cmd === 'WHOIS') {
    const targetNick = rest.join(' ').trim();
    if (!targetNick) return socket.emit('server-message', 'Usage: WHOIS <nickname>');

    // Foydalanuvchini nick orqali qidirish uchun loop
    let foundInfo = null;
    for (const info of clients.values()) {
        if (info.nick === targetNick) {
            foundInfo = info;
            break;
        }
    }

    if (foundInfo) {
      if (foundInfo.room) {
        // Agar xonada bo'lsa
        socket.emit('server-message', `${targetNick} is currently in room: ${foundInfo.room}`);
      } else {
        // Agar xonada bo'lmasa, lekin ulangan bo'lsa
        socket.emit('server-message', `${targetNick} is connected but not in a room.`);
      }
    } else {
      // Agar bunday nickli foydalanuvchi umuman ulangan bo'lmasa
      socket.emit('server-message', `User ${targetNick} not found.`);
    }
    console.log(`[WHOIS] ${info.nick} checked info for ${targetNick}`);
    return;
  }
  // WHOIS buyrug'i tugadi

  socket.emit('server-message', `Unknown command: ${cmd}. Use NICK, JOIN, MSG.`);
}

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));


