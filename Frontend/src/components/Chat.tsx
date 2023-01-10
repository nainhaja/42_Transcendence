import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Socket } from 'socket.io-client';
import axios from 'axios';
import ChatWindow from './chatwindow';

import { ChatContext, IChatData } from '../Contexts/ChatContext';

enum NOTIF_STATUS {
  FAILED = 'Failed',
  SUCCESS = 'Success',
  UPDATE = 'Update',
  RESTRICTED = 'Restricted',
}

enum RESTRICTION {
  BAN = 'BAN',
  MUTE = 'MUTE',
  KICK = 'KICK',
}

enum ACCESS {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  PROTECTED = 'PROTECTED',
  DM = 'DM'
}

enum MUTEDURATION {
  HALFMIN = '15 SEC',
  MIN = '1 MIN',
  HALFHOUR = '30 MIN',
  HOUR = '1 HOUR'
}

interface frontEndPayload{
  updatoruser: string,
  updateduser: string,

  room: string,

  roomaccess: string,

  newroomname: string,

  restriction: string,
  muteduration: string,

  message: string,
}

class frontEndPayload{
  constructor(){}

  setLeave() {}

  setCreateRoom() {}

  setJoin() {}
  
  setMessage() {}
  
  setEnter() {}

  SetInvite() {}
  
  setAccess() {}

  setRoomName(){}

  setRole() {}

  setRestriction(updater: string, 
    updated: string, 
    restriction: string,
    duration: string){
      this.updatoruser = updater;
      this.updateduser = updated;
      this.restriction = restriction;
      this.muteduration = duration;
    }


}

interface backEndPayload{
  notification: {
    status: string,
    statuscontent: string,
  },
  payload: {
    messagesArray: [],
    roomsArray: [],
    updatoruser: string,
    updateduser: string,

    whatever: string,
  }
}

class backEndPayload{
  constructor(){}
}


const chatdata: IChatData = {
  rooms: [],
  messages: [],
  test: 'hello',
};

function Chat() {
  const data: object= {};
  const [user, setUser] = useState('');
  const [chatRoomId, setChatRoomId] = useState('');
  const [text, setText] = useState('');
  // const [socket, setSocket] = useState<null | SocketIOClient.Socket>(null);
  //const [socket, setSocket] = useState<null | Socket>(null);
  const socket = useRef(null as null | Socket);
  // const [messages, setMessages] = useState([]);
  const [messages, setMessages] = useState<{ room: string, msg: string }[]>([]);
  const [roomName, setRoomName] = useState('');
  // const [rooms, setRooms] = useState([]);
const [rooms, setRooms] = useState<{ name: string }[]>([]);

  const [room, setRoom] = useState('');
  const [joinedRoom, setJoinedRoom] = useState('');
  const [chatRoomName, setChatRoomName] = useState('');

  useEffect(() => {
    // const socket = io({
    //   path: '/chat',
    //   port: 6000
    // });

    socket.current = io("http://localhost:4000/", {
      withCredentials: true,
    }).on("connect", () => {



        console.log("connected successfully");

    })
    .on('connection', (payload: backEndPayload) => {

      console.log("The payload received is : ");
      console.log(payload.payload.whatever);
      
    })

    .on('recieved', msg => {
      console.log("The message  i received is : "+msg);
      receiveMessage(msg);
    })


    .on('roomcreated', room => {
      console.log("Wselt hna habibi");
      RoomCreated(room);
    })
    .on('joined', room => {
      RoomJoined(room);
    });
  }, []);

  function sendMessage() {
   // console.log(`send message to room ${joinedRoom} from ${rooms}`);
    if (joinedRoom) {
      socket.current?.emit('recieved', { room: joinedRoom, msg: text , sender: socket.current.id});
      setText('');
    } else {
      alert('join room first');
    }
  }

  function receiveMessage(msg : any) {
    let edit = '';
    if (msg.sender !== socket.current?.id){
      edit = 'them : '  + msg.msg;
      msg.msg = edit;
    }
    else{
      edit = 'you : '  + msg.msg;
      msg.msg = edit;
    }
    setMessages(prevMessages => [...prevMessages, { room: msg.room, msg: msg.msg }]);
    console.log("The message  i received is : "+messages);
    //console.log("Setted data is : "+messages[0]);
    // setMessages(prevMessages => [...prevMessages, msg.msg]);

  }

  function createRoom() {
    let roominfo = {
      name: roomName,
      type: 'public'
    }
    socket.current?.emit('createRoom', roominfo);
    setRoomName('');
    console.log("I created a room ");
  }

  function RoomCreated(room: any) {
    setRooms(prevRooms => [...prevRooms, room]);
  }

  function joinChatRoom() {
    socket.current?.emit('join', chatRoomName);
    console.log(` joining ${chatRoomName}`);
    setJoinedRoom(chatRoomName);
    setChatRoomName('');
  }

  function leaveChatRoom() {
    socket.current?.emit('leave', joinedRoom);
    setJoinedRoom('');
  }

  function RoomJoined(room: any) {
    setMessages([]);
    console.log(`joined room succesfully : ${joinedRoom}`);
  }

  return (
    <div>
      <h1>
        You are Seeing Messages From ChatRoom: {joinedRoom ? joinedRoom : 'No haven\'t Joined a Room yet'}
      </h1>
      <form>
        <input value={text} onChange={e => setText(e.target.value)} type="text" />
        <button type="submit" onClick={e => { e.preventDefault(); sendMessage(); }}>Send Message</button>
      </form>
      <form>
        <input value={roomName} onChange={e => setRoomName(e.target.value)} type="text" />
        <button type="submit" onClick={e => { e.preventDefault(); createRoom(); }}>Create Room</button>

      </form>
      <form>
        <input value={chatRoomName} onChange={e => setChatRoomName(e.target.value)} type="text" />
        <button type="submit" onClick={e => { e.preventDefault(); joinChatRoom(); }}>Join Room</button>
        <button type="submit" onClick={e => { e.preventDefault(); leaveChatRoom(); }}>Leave Current Room</button>
      </form>
      <p>
        <h3>Available Rooms To Join</h3>
        <ul>
          {rooms.map(room => (
            <li key={room.name}>{room.name}</li>
          ))}
        </ul>
      </p>
      <p>
        <h3>Room Messages {joinedRoom}</h3>
        <ul>
          {messages.map(msg => (
           <li key={'index'}>{msg.msg}</li>
          ))}
        </ul>


      </p>

      <div className="flex h-full w-full">
      <div className="w-14  flex flex-col items-center justify-between bg-black">
        <div className="m-3 w-10 h-10 bg-black">
          <img src='logo.svg' alt="emmm" />
        </div>
        <div className="flex flex-col m-3 w-10">
          <img className="py-3 w-9" src='dashboard.svg' alt="emmm" />
          <img className="py-3 w-9" src='settings.svg' alt="emmm" />
          <img className="py-3 w-9" src='addfriends.svg' alt="emmm" />
          <img className="py-3 w-9" src='Chats.svg' alt="emmm" />
          <img className="py-3 w-9" src='profile.svg' alt="emmm" />
        </div>
        <div className="mb-3">
          <img className="py-3 w-9" src='logout.svg' alt="emmm" />
        </div>
      </div> 
      <div className="flex flex-col w-full">
          <ChatContext.Provider value={chatdata}>
            <ChatWindow />
          </ChatContext.Provider>
      </div>
    </div>
    </div>
  );
}

export default Chat;
