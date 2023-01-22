import React from "react";
import { ChatData } from "../../../context/ChatUserContext";


export const Message = (props: any) => {
    const sender = props.message.sender;
    const messagecontent = props.message.messagecontent;
    const profile = props.message.profile;
    const owner = sender == ChatData.userName ? 'owner' : '';
    const classname = 'message ' + owner;


    return (
        <div className= {classname}>
            <div className="messageinfo">
                <img src={profile} alt="" />
                <p>{sender}</p>
            </div>
            <div className="messagecontent">
                <p> {messagecontent} </p>
            </div>
        </div>





    );
}