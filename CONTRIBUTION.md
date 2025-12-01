## Team Contributions – Homework 3

### Member 1 – Server Core Developer

**Name:** Sharifova Durdona Uchkun Kizi – **ID:** 24013572

**Main responsibilities:**

-   Designed and implemented the main TCP/HTTP server in `server.js` using Node.js and Socket.IO.
-   Implemented socket handling:
    -   Connection setup and welcome message.
    -   Command parsing and dispatch in `handleCommand(...)`.
    -   Graceful disconnect handling and room leave notifications.
-   Implemented core commands and protocol:
    -   `NICK`, `JOIN`, `MSG`, `WHOIS`.
    -   Validation of input (empty nicknames, room membership, max message length).
-   Implemented message ID generation and in‑memory reaction store:
    -   `messageReactions` `Map` and `messageIdCounter`.
    -   Emitting `room-message` with `{ room, from, text, msgId }`.
    -   Implemented `REACT` command and `reaction-update` broadcast logic.
-   Ensured the server runs continuously and cleanly handles multiple concurrent clients.

Evidence: `server.js` (full file), server log behavior during demo, protocol description in `README.md`.

---

### Member 2 – Room and User Management Developer

**Name:** Bobokhonova Dilshoda – **ID:** 23013076

**Main responsibilities:**

-   Designed and implemented the **room and client state management** on the server:
    -   `clients` `Map` structure storing `{ nick, room }` per socket.
    -   Logic for joining/leaving rooms and broadcasting server messages to the correct room.
-   Implemented the high‑level **chat protocol design**:
    -   Decided on command syntax: `NICK`, `JOIN`, `MSG`, `REACT`, `WHOIS`.
    -   Documented protocol behavior in `README.md` under “Protocol & API”.
-   Implemented client‑side room management helpers in `client/script.js`:
    -   `joinRoom(roomName)` function that updates active room labels and sends `JOIN`.
    -   Integration with the “Saved Rooms” sidebar to reuse room names.
-   Ensured correct delivery semantics:
    -   Messages are broadcast only to users in the same room.
    -   Join/leave notifications (`server-message`) are visible to room participants.

Evidence: `server.js` (JOIN, MSG, WHOIS logic), `client/script.js` (`joinRoom`, room labels), protocol description in `README.md`.

---

### Member 3 – Client Application Developer

**Name:** Tillabaev Yosinbek – **ID:** 25013516

**Main responsibilities:**

-   Built the **front‑end client** in `client/index.html`, `client/script.js`, and `client/style.css`:
    -   Layout: sidebar + main chat area + message input.
    -   Components: nickname/room controls, active room badge, saved rooms list, chat header, messages list, and input form.
-   Implemented the **Socket.IO client logic**:
    -   Connecting to the server, listening for `server-message`, `room-message`, and `reaction-update`.
    -   Rendering messages with metadata (sender, timestamp, reply quote, reactions).
    -   Handling UI events: send message, reply, react, copy, emoji picker, dark‑mode toggle.
-   Implemented advanced client features:
    -   **Reply** preview bar above the input.
    -   Telegram‑style inline reply quote in the message bubble.
    -   Hover‑only action bar (Reply / Copy / React).
    -   Emoji picker for per‑message reactions.
-   Implemented **Saved Rooms** and nickname persistence on the client using `localStorage`:
    -   `chat_rooms`, `chat_nick`, `darkMode` keys.
    -   Saved rooms UI (join on click, delete, clear all).

Evidence: `client/index.html`, `client/script.js`, `client/style.css`, live demo behavior in the browser.

---

### Member 4 – Testing and Documentation Lead

**Name:** Olimjonov Hojiakbar – **ID:** 23012976

**Main responsibilities:**

-   Wrote and organized **documentation and demo materials**:
    -   This `CONTRIBUTION.md` file for individual grading.
    -   Updated `README.md` with protocol details, build/run steps, and a full 15‑minute demo script.
    -   Ensured team names, IDs, and roles appear clearly in the README and source comments.
-   Testing responsibilities:
    -   Multi‑client testing with multiple browser windows joining the same and different rooms.
    -   Verified NICK/JOIN/MSG/REACT/WHOIS commands and error handling.
    -   Tested saved rooms persistence across refresh and dark‑mode persistence.
-   Build & run experience:
    -   Added a simple `Makefile` with `install`, `run`, `dev`, and `demo` targets.
    -   Verified a clean checkout (`npm install && npm start`) is enough to run the system.

Evidence: `README.md`, `CONTRIBUTION.md`, `Makefile`, and testing notes reflected in the demo script.
