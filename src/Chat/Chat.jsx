import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./Chat.css";

// Connect to Socket.IO server
const socket = io("https://replit.com/@arahsan125/NodeChatSocket"); 

function Chat() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [password, setPassword] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState("");
  const [wrong, setwrong] = useState("")

  useEffect(() => {
    // Handle messages
    const handleMessage = (msg) =>
      setMessages((prev) => [...prev, msg]);
    const handleerr =(errmsg)=>{
      setwrong(errmsg)
    }

    // Handle typing indicator
    const handleTyping = (typingUser) => {
      if (typingUser === username) return;
      setTyping(`✍️ ${typingUser} is typing...`);
      setTimeout(() => setTyping(""), 1000);
    };

    // Handle successful join
    const handleJoinSuccess = (roomName) => {
      setJoined(true);
      console.log(`✅ Joined room: ${roomName}`);
    };

    // Attach listeners
    socket.on("server-message", handleMessage);
    socket.on("user-typing", handleTyping);
    socket.on("join-success", handleJoinSuccess);
    socket.on("join-error",handleerr)

    // Cleanup
    return () => {
      socket.off("server-message", handleMessage);
      socket.off("user-typing", handleTyping);
      socket.off("join-success", handleJoinSuccess);
    };
  }, [username]);

  // Request to join room
  const handleJoin = () => {
    if (!username || !room || !password) {
      return alert("Enter username, room, and password!");
    }
    socket.emit("join", { username, room, password });
  };

  // Send chat message
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit("chat-message", { text: input, username, room });
    setInput("");
  };

  // Notify typing
  const handleTypingEvent = () => {
    socket.emit("typing", room || null);
  };

  return (
    <div className="chat-app">
      {!joined ? (
        <div className="join-box">
          <h2>Join Chat</h2>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter room password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            
          />
          <p>{wrong}</p>
          <button onClick={handleJoin}>Join</button>
        </div>
      ) : (
        <div className="chat-box">
          <h2>💬 Room {room}</h2>
          <div className="messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${
                  msg.username === username ? "own" : "other"
                }`}
              >
                <strong>{msg.username}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="typing">{typing}</div>
          <form onSubmit={handleSend} className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={handleTypingEvent}
              placeholder="Type a message..."
            />
           
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
