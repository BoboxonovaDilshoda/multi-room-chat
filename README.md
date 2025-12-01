Multi‑Room Chat Application – Homework 3

### Team Information

-   **Sharifova Durdona Uchkun Kizi** – ID: 24013572 – Server Core Developer
-   **Bobokhonova Dilshoda** – ID: 23013076 – Room & User Management Developer
-   **Tillabaev Yosinbek** – ID: 25013516 – Client Application Developer
-   **Olimjonov Hojiakbar** – ID: 23012976 – Testing & Documentation Lead

See `CONTRIBUTION.md` for detailed, per‑member tasks and evidence.

### Live Demo

-   Deployment: [https://multi-room-chat-wxsh.onrender.com/](https://multi-room-chat-wxsh.onrender.com/)

### Project Overview

This project is a real‑time, multi‑room chat system built on **TCP** using Node.js’ HTTP server and Socket.IO transport.  
The server exposes a simple, text‑based command protocol on top of a persistent TCP/WebSocket connection and serves the web client over **HTTP**.

The system supports multiple named rooms, nicknames, message replies, emoji reactions, and a local “saved rooms” feature on the client.

### Protocol & API (for rubric)

-   **Transport:**
    -   Server uses Node’s `http` module (TCP) plus Socket.IO (WebSocket over HTTP).
    -   Each browser client maintains one persistent socket connection to the server.
-   **Application protocol (room chat):** simple command format, sent as UTF‑8 strings:
    -   `NICK <name>` – set/update nickname.
    -   `JOIN <room>` – join or move to a new room.
    -   `MSG <room> <message...>` – send a message to a room.
    -   `REACT <msgId> <emoji>` – add / change / remove a reaction on a message.
    -   `WHOIS <nick>` – query which room a user is in.
-   **Server → client events (via Socket.IO channels):**
    -   `server-message` – informational messages (joins, leaves, errors).
    -   `room-message` – chat message payload: `{ room, from, text, msgId }`.
    -   `reaction-update` – updated reaction counts for a message.

### Features & Functionality

-   **Multi‑room chat**
    -   Users can join any room name; server keeps room membership and broadcasts messages only to members of that room.
    -   Each message is tagged with a unique `msgId` so reactions can be tracked per message.
-   **Nicknames**
    -   Nickname is set via the sidebar and persisted in `localStorage` (`chat_nick`).
    -   The header shows the active nickname; default is `Guest` until user sets one.
-   **Replies (Telegram‑style)**
    -   Clicking **Reply** on a message shows a small reply preview bar above the input.
    -   The outgoing message encodes reply metadata in the text as  
        `"[REPLY:<author>:<quoted>]<message>"`.
    -   The client parses this format and renders a compact quoted block inside the bubble.
-   **Emoji reactions**
    -   Hover over a message → action bar appears → **React** button shows a small emoji picker.
    -   One reaction per user per message:
        -   Clicking the same emoji again removes your reaction.
        -   Clicking a different emoji switches your reaction.
    -   Reactions are broadcast using `REACT`/`reaction-update` so **all clients see the same counts**.
-   **Saved rooms (client‑side)**
    -   Every successful `JOIN` saves the room into `localStorage` (`chat_rooms`).
    -   Right sidebar shows a scrollable **Saved Rooms** list with:
        -   Room initials icon.
        -   Room name.
        -   “Last joined” time (e.g. `5m ago`, `2h ago`).
    -   Clicking a saved room re‑joins it.
    -   Per‑room delete button and a global “clear all rooms” button.
-   **Dark mode**
    -   Toggle button in the sidebar switches between light/dark themes.
    -   Preference is stored in `localStorage` (`darkMode`) and applied on load.

### Code Layout

-   `server.js` – TCP/HTTP + Socket.IO chat server
    -   Handles connections, commands (`NICK`, `JOIN`, `MSG`, `REACT`, `WHOIS`), rooms, and reactions.
-   `client/index.html` – Single‑page web UI for the chat client.
-   `client/style.css` – Full UI styling, including responsive layout, message bubbles, replies, reactions, dark mode, and saved rooms.
-   `client/script.js` – Client logic:
    -   Connects to server via Socket.IO.
    -   Sends commands in the defined protocol format.
    -   Renders messages, replies, reactions, saved rooms, nickname, and theme.
-   `Makefile` – simple build/run helper.
-   `package.json` – Node.js metadata and NPM scripts.
-   `CONTRIBUTION.md` – detailed per‑member breakdown for the individual score.

### Build & Run (for clean checkout)

Requirements:

-   Node.js (v18+ recommended)
-   npm

Steps:

1. **Install dependencies**

    ```bash
    make install
    # or
    npm install
    ```

2. **Run the server**

    ```bash
    make run
    # or
    npm start
    ```

3. **Open the client**

    - Navigate to `http://localhost:5000` in two or more browser windows/tabs.

### Demo Script (15‑minute presentation)

1. **Start server** in one terminal: `make run`.
2. **Open two browser windows** at `http://localhost:5000`.
3. **Set nicknames** in each window and show that the header and server logs update.
4. **Join the same room** (e.g. `re`) from both clients; show server log `[JOIN]` events.
5. **Exchange messages**, then demonstrate:
    - Replying to a message (quote appears inside bubble).
    - Adding/removing/swapping emoji reactions and observing them update in both windows.
6. **Saved rooms**:
    - Join several rooms; show that they appear in the **Saved Rooms** list.
    - Click a saved room to rejoin it.
    - Delete an individual room and use the **Clear all** button.
7. **Dark mode**: toggle and refresh to show the preference is persisted.
8. Briefly walk through `server.js`, `client/script.js`, and `CONTRIBUTION.md` to highlight roles.

This flow directly supports the rubric items: protocol/API correctness, functionality, code quality, and a clear live demo.
