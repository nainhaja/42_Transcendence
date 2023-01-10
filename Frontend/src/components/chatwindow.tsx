
import React, { useState } from 'react';
import ChatBox from './chatbox';
// import ChatBoxSection from './chatboxsection';
import EnteringChat from './enteringchat';
import MappingChatBoxSection from './ChatSectionComponents/MappingChatBoxSection';

export const SectionMsgsData = [
  [{
    id: 1,
    user: 'Nainhaja',
    msg: 'Hello, how are you?',
    Date: '00:00',
    ProfilePic: 'profilepicture.jpeg',
  },
  {
    id: 2,
    user: 'Ayajrhou',
    msg: 'Hello, how are you?',
    Date: '00:00',
    ProfilePic: 'profilepicture.jpeg',
  },
  {
    id: 1,
    user: 'Nainhaja',
    msg: 'Great.',
    Date: '00:00',
    ProfilePic: 'profilepicture.jpeg',
  },
  {
    id: 2,
    user: 'Ayajrhou',
    msg: 'Okay.',
    Date: '00:00',
    ProfilePic: 'profilepicture.jpeg',
  },

  ],
  [{
    id: 1,
    user: 'AMine',
    msg: 't9wd',
    Date: '00:00',
    ProfilePic: 'hgrissen.jpeg',
  },
  {
    id: 2,
    user: 'Ayajrhou',
    msg: 'Hello, how are you?',
    Date: '00:00',
    ProfilePic: 'profilepicture.jpeg',
  },
  {
    id: 1,
    user: 'AMine',
    msg: 'T9wwd.',
    Date: '00:00',
    ProfilePic: 'hgrissen.jpeg',
  },
  {
    id: 2,
    user: 'Ayajrhou',
    msg: 'Okay.',
    Date: '00:00',
    ProfilePic: 'profilepicture.jpeg',
  },

  ],
  [{
    id: 1,
    user: 'sousou',
    msg: 'mikrob',
    Date: '00:00',
    ProfilePic: 'sel-fcht.jpeg',
  },
  {
    id: 2,
    user: 'Ayajrhou',
    msg: 'Hello, how are you?',
    Date: '00:00',
    ProfilePic: 'profilepicture.jpeg',
  },
  {
    id: 1,
    user: 'sousou',
    msg: 'chchcchch ',
    Date: '00:00',
    ProfilePic: 'sel-fcht.jpeg',
  },
  {
    id: 2,
    user: 'Ayajrhou',
    msg: 'Okay.',
    Date: '00:00',
    ProfilePic: 'profilepicture.jpeg',
  },

  ],

];


function ChatWindow() {
  const [showChatBox, setShowChatBox] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<{ id: number, user: string, msg: string, Date: string, ProfilePic: any }[]>([]);  const [showEnteringChat, setShowEnteringChat] = useState(true);

  const handleChatBoxSectionClick = (convId: number) => {
    console.log('ChatBoxSection clicked')
    console.log({ convId })

    setSelectedConversation(SectionMsgsData[convId]);
    setShowChatBox(true);
    setShowEnteringChat(false);

  }
  const handleSearchIconClick = () => {
    setShowEnteringChat(true);
    setShowChatBox(false);
  }


  return (
    <div className="flex flex-row">

      <div className="bg-mine-450 w-96 h-screen flex flex-col overflow-auto ">
        <div className=" p-8 flex flex-col bg-mine-450">
          <div className="flex justify-center items-center bg-black">
            <input type="text"
              className="p-2 w-10/12 bg-black text-white "
              placeholder="Search for users"
            />
            <img src='search.svg' alt="search"></img>
          </div>
          <div>
            <img src='back.png' alt="back.png" className="w-1/6  flex-col" onClick={handleSearchIconClick} ></img>
          </div>
        </div>

        <MappingChatBoxSection onClick={handleChatBoxSectionClick} />
        <MappingChatBoxSection onClick={handleChatBoxSectionClick} />
      </div>
    
      {showEnteringChat && <EnteringChat />}
      {showChatBox && <ChatBox sectionMsgsData={selectedConversation} />}
   



    </div>
  );
}

export default ChatWindow;