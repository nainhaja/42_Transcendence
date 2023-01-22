import React, { useState } from "react";
import { ChatData, Currentsocket } from "../../../context/ChatUserContext";


export const Input = (props: any) => {
    const [message, setMessage] = useState('');


    

    const handleChange = (event: any) => {
        setMessage(event.target.value);
    };



    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter') {
            // console.log('send this message: ' + message + ' in ' + sentpayload.roomname);
            // 👇 Get input value
            // setUpdated(message);
            //event.preventDefault();


            const sentpayload = {
                roomid: ChatData.activeRoomId,
                roomname: ChatData.activeRoomName,
                message: message,
            }

            setMessage('');
            event.target.value = '';
            let newmesg = { sender: ChatData.userName, messagecontent: message, profile: ChatData.profile, roomid: ChatData.activeRoomId };
            //props.addMessage(newmesg);
            Currentsocket.emit('recievemessage', sentpayload);
        }
    };

    return (
        <div className="input">
            <input
                type="text"
                placeholder="Type something..."
                onChange={handleChange}
                onKeyDown={handleKeyDown} />

            <div className="send">
            </div>
        </div>
    );
}