import React, { useEffect } from "react";
import '../style.scss'
import { Chat } from "../components/Chat_components/Chat";
import { Navbar } from "../components/Chat_components/Navbar";
import { SideBar } from "../components/Chat_components/Sidebar";
import io, { Socket } from 'socket.io-client';
import {  IChatData, ChatData, Currentsocket} from "../context/ChatUserContext";









//  = io("http://localhost:4000/", {
//     withCredentials: true,
//     }).on('connection', (recvpayload: any) => {
//         let p = recvpayload;
//         ChatData.userName = p.payload.username;
//         ChatData.id = p.payload.id;
//         ChatData.fullName = p.payload.fullname;
//         ChatData.profile = p.payload.profile;
//     });


// export let Currentsocket: any;

export const ChatPage = () => {

        //console.log("heeeeeeh  " + Currentsocket.id);
        Currentsocket.on('connection', (recvpayload: any) => {
            let p = recvpayload;
            ChatData.userName = p.payload.username;
            ChatData.id = p.payload.id;
            ChatData.fullName = p.payload.fullname;
            ChatData.profile = p.payload.profile;
            console.log('wa si zaaaabi');
    
    
    
            
        });

    useEffect(() => {

Currentsocket.emit('connectpls');
    

    }, [])

    return (
        <div className="chatpage">
            <div className="container">
                {/* <ChatUserContext.Provider value={ChatData}> */}
                <Navbar/>
                <SideBar/>
                {/* </ChatUserContext.Provider> */}
                <Chat/> 
            </div>
        </div>
    )
}

// io("http://localhost:4000/", {
//         withCredentials: true,
//         }).on('connection', (recvpayload: any) => {
//             let p = recvpayload;
//             ChatData.userName = p.payload.username;
//             ChatData.id = p.payload.id;
//             ChatData.fullName = p.payload.fullname;
//             ChatData.profile = p.payload.profile;
//         });