Multi-Room Chat Application

This project is a real-time, multi-user chat application built on the Node.js environment, utilizing Express and Socket.IO for seamless, persistent communication. Users can join various topic-based rooms and interact in real-time.

## Key Features

* **Real-Time Messaging:** Leverages Socket.IO for establishing WebSockets and enabling fast, two-way communication between the client and server.
* **Multi-Room Support:** Users can switch between different chat rooms, allowing for topic separation.
* **User Nicknames:** Users must set a unique nickname before participating in the chat.
* **Custom Commands:** Support for in-chat commands to manage the user's nickname and room status.

## Technologies Used

**Backend (Server):**

* **Node.js:** JavaScript runtime environment.
* **Express.js:** Minimalist and flexible Node.js web application framework.
* **Socket.IO:** Library for real-time application development.

**Frontend (Client):**

* **HTML/CSS:** Structure and styling of the user interface.
* **JavaScript:** Client-side logic for handling user input and real-time updates.

## Setup and Installation

To run this application on your local machine, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/BoboxonovaDilshoda/multi-room-chat.git](https://github.com/BoboxonovaDilshoda/multi-room-chat.git)
    cd multi-room-chat
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Start the Server:**
    ```bash
    node server.js
    ```
4.  Open your web browser and navigate to **`http://localhost:5000`**.

## In-Chat Commands

The application supports the following commands, entered directly into the message input field:

* **Change Nickname:** `/nick <new_name>`
* **Join a Room:** `/join <room_name>`

---

## Author

Dilshoda Boboxonova
