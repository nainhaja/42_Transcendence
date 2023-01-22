import React, { useState } from "react";
import { Room } from "./Room";
import io from 'socket.io-client';
import { Currentsocket } from "../../../context/ChatUserContext";




export const Rooms = (props: any) => {
    // const [rooms, setRooms] = useState([
    //     // {profile: 'hgrissen.jpeg',                      roomname: 'fibo',   lastmessage: 'selm 3lik sma9lo!!',  id: 1},
    //     // {profile: 'https://api.multiavatar.com/Bd.png', roomname: 'soso',   lastmessage: 'malk asi zebi?'    ,  id: 2},
    //     // {profile: 'https://api.multiavatar.com/nd.png', roomname: 'nizar',  lastmessage: 'Awaw?'             ,  id: 3},
    // ]);

    // function timeout(delay: number) {
    //     return new Promise( res => setTimeout(res, delay) );
    // }

    // Currentsocket.on('roomcreate', (payload: any) => {
    //     //console.log('helloasufbakhjsbfjakbsf' + payload);
    //     //setRooms(payload.payload.rooms);
    //     //fetch user 
    //     //fecth rooms
    //     //
    // }).on('connection', async (payload: any) =>{
    //     await timeout(300); //for 1 sec delay
    //     // console.log('waaaaaa l7wa' + rooms[0]);
    //     const p = payload;
    //     //console.log('helllo ' + p.payload.rooms[0].name);
    //     setRooms(p.payload.rooms);
    // })



    
    return (
        <div className="rooms">
            <div className="container">
                {props.rooms.map((room: any) => (
                    <Room room={room} key={room.id}/>
                ))}
            </div>
        </div>
    );
}