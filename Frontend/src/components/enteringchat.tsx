import React, { useContext, useState } from 'react';
import { ChatContext } from '../Contexts/ChatContext';
import  CreateRoom from './ChatRooms/createRoom'

function EnteringChat() {
  const test = useContext(ChatContext);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showEnteringChat, setShowEnteringChat] = useState(true);

const handleCreateRoomClick = () => {
    setShowEnteringChat(false);
    setShowCreateRoom(true);
  }

 

  return (

      <div className="w-11/12 h-full flex justify-center items-center bg-mine-470 p-2">
        { showEnteringChat && 
       <div className="flex h-1/4 w-full md:w-2/4 rounded-full text-center items-center justify-center bg-black text-mine-490 text-7xl
         hover:bg-mine-490 hover:text-black " onClick={handleCreateRoomClick}>
          {test.rooms[0].name}
        </div>
        }
        { showCreateRoom && 
          <CreateRoom />
        }
      </div>  
  );
}

export default EnteringChat;