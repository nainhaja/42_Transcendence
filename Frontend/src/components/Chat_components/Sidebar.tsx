import React, { useState } from "react";
import { Currentsocket } from "../../context/ChatUserContext";

import { CreateRoom } from "./Sidebar_components/CreateRoom";
import { Rooms } from "./Sidebar_components/Rooms";
import { Search } from "./Sidebar_components/Search";




export const SideBar = () => {
    const [rooms, setRooms] = useState<any>([]);
        // {profile: 'hgrissen.jpeg',                      roomname: 'fibo',   lastmessage: 'selm 3lik sma9lo!!',  id: 1},
        // {profile: 'https://api.multiavatar.com/Bd.png', roomname: 'soso',   lastmessage: 'malk asi zebi?'    ,  id: 2},
        // {profile: 'https://api.multiavatar.com/nd.png', roomname: 'nizar',  lastmessage: 'Awaw?'             ,  id: 3},
    // ]);

    function timeout(delay: number) {
        return new Promise( res => setTimeout(res, delay) );
    }

    Currentsocket.on('roomcreate', (payload: any) => {
        console.log('should be here');
        setRooms([payload.payload.room, ...rooms]);
       // setMessages([...messages, message]);
    })
    .on('connection', async (payload: any) =>{
        await timeout(300); //for 1 sec delay
        // console.log('waaaaaa l7wa' + rooms[0]);
        const p = payload;
        //console.log('helllo ' + p.payload.rooms[0].name);
        setRooms(p.payload.rooms);
    })
    .on('roomsupdate', (payload: any) => {
        //request roomupdate
       setRooms(payload.payload.rooms)
    })
    .on('requestroomsupdate', () => {
        //request roomupdate
        Currentsocket.emit('updaterooms');
    })

    return (
        <div className="sidebar">
            <CreateRoom/>
            {/* <Search/> */}
            <Rooms rooms={rooms}/>
        </div>
    );
}