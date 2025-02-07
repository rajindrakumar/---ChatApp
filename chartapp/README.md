Hello , It's me Rajindra kumar sah . 

छलफल (Chhalfal) is a chat application developed using the MERN stack, designed to facilitate real-time communication between users. The name "छलफल" translates to "Discussion" or "Debate" in Nepali, which reflects the app’s goal to provide a platform for engaging and interactive conversations.



Before Deployment : 

chat.js
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



server side - index.js

const http=require("http");
const express =require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const port = 4500 || process.env.PORT ;

const users=[{}];

app.use(cors());
app.get("/",(req,res)=>{
    res.send("HELL ITS WORKING");
})

const server=http.createServer(app);

const io=socketIO(server);

io.on("connection",(socket)=>{
    console.log("New Connection");

    socket.on('joined',({user})=>{
          users[socket.id]=user;
          console.log(`${user} has joined `);
          socket.broadcast.emit('userJoined',{user:"Admin",message:` ${users[socket.id]} has joined`});
          socket.emit('welcome',{user:"Admin",message:`Welcome to the chat,${users[socket.id]} `})
    })

    socket.on('message',({message,id})=>{
        io.emit('sendMessage',{user:users[id],message,id});
    })

    socket.on('disconnect',()=>{
          socket.broadcast.emit('leave',{user:"Admin",message:`${users[socket.id]}  has left`});
        console.log(`user left`);
    })
});

server.listen(port,()=>{
    console.log(`server is working on http://localhost:${port}`);
})