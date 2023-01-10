import React from 'react';
import ChatBoxSection from '../chatboxsection';



export const SectionChatData = [
    {
      id: 1,
      UserName: 'Nainhaja',
      LastMessage: 'Hello, how are you?',
      Date: '00:00',
      ProfilePic: 'profilepicture.jpeg',
    },
    {
      id: 2,
      UserName: 'Hgrissen',
      LastMessage: "I'm good, thanks for asking! How about you?",
      Date: '05:00',
      ProfilePic: 'hgrissen.jpeg',
    },
    {
      id: 3,
      UserName: 'Sel-fcht',
      LastMessage: "I'm doing well too. Thanks for asking!",
      Date: '10:00',
      ProfilePic: 'sel-fcht.jpeg',
    }
  ];

function MappingChatBoxSection(handleChatBoxSectionClick: any) {
  
  return (
    <div >
      {SectionChatData.map((message, idx) => (
        <ChatBoxSection
          key={message.id}
          UserName={message.UserName}
          LastMessage={message.LastMessage}
          Date={message.Date}
          ProfilePic={message.ProfilePic}
          onClick={function () { handleChatBoxSectionClick.onClick(idx) } }
        />
      ))}
    </div>
  );
}

export default MappingChatBoxSection;
