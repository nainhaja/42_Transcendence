import React from "react";

//import More from './resources/more.svg';

import ChatWindow from './chatwindow';
//import ParentComponent from './components/parentcomponent';

// import Rooms from './rooms.json';
//import ProfilePicture from './resources/profilepicture.jpeg';

function Main_chat()
{
  return (
    // <div className="px-14 h-12 w-screen flex flex-wrap items-center justify-between bg-green-100"></div>
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
        <ChatWindow/>
      </div>
    </div>
  );
} 

export default Main_chat;