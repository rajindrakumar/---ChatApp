import React, { useEffect, useState } from 'react';
import { user } from "../join/join";
import socketIo from "socket.io-client";
import "./Chat.css";
import sendLogo from "../../images/send.png";
import Message from "../Message/Message";
import ReactScrollToBottom from "react-scroll-to-bottom";
import closeIcon from "../../images/closeIcon.png";

let socket;
const ENDPOINT = "http://localhost:4500/";

const Chat = () => {
    const [id, setId] = useState("");
    const [messages, setMessages] = useState([]);

    const send = () => {
        const message = document.getElementById('chatInput').value.trim();
        if (message) {
            socket.emit('message', { message, id });
            document.getElementById('chatInput').value = "";
        }
    };

    console.log(messages);

    useEffect(() => {
        socket = socketIo(ENDPOINT, { transports: ['websocket'] });

        socket.on('connect', () => {
            alert('Connected');
            setId(socket.id);
        });

        socket.emit('joined', { user });

        socket.on('welcome', (data) => {
            setMessages(prevMessages => [...prevMessages, data]);
        });

        socket.on('userJoined', (data) => {
            setMessages(prevMessages => [...prevMessages, data]);
        });

        socket.on('leave', (data) => {
            setMessages(prevMessages => [...prevMessages, data]);
        });

        return () => {
            if (socket) {
                socket.disconnect();  // ✅ Correctly disconnecting the socket
            }
        };
    }, []);

    useEffect(() => {
        const handleMessage = (data) => {
            setMessages(prevMessages => [...prevMessages, data]);
        };

        socket.on('sendMessage', handleMessage);

        return () => {
            socket.off('sendMessage', handleMessage);
        };
    }, []); // ✅ Removed `messages` dependency to prevent event listener duplication

    return (
        <div className="chatPage">
            <div className="chatContainer">
                <div className="header">
                    <h2>छलफल ~♡</h2>
                    <a href="/"> <img src={closeIcon} alt="Close" /></a>
                </div>
                <ReactScrollToBottom className="chatBox">
                    {messages.map((item, i) => (
                        <Message 
                            key={i} 
                            user={item.id === id ? '' : item.user} 
                            message={item.message} 
                            classs={item.id === id ? 'right' : 'left'} 
                        />
                    ))}
                </ReactScrollToBottom>
                <div className="inputBox">
                    <input 
                        onKeyPress={(event) => event.key === 'Enter' ? send() : null} 
                        type="text" 
                        id="chatInput" 
                    />
                    <button onClick={send} className="sendBtn">
                        <img src={sendLogo} alt="Send" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
