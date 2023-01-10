import React from 'react';
import{ useState } from 'react';

function CreateRoom() {
    const [showPublicRoom, setShowPublicRoom] = useState(false);
  
    function handlePublicClick() {
      console.log("click");
      setShowPublicRoom(true);
    }

    return (
        <>
        { !showPublicRoom ? 
    <div className="flex flex-col h-3/4 w-full md:w-2/4 text-center items-center justify-center bg-black text-mine-490 text-3xl p-4">
        
        <div> <span className="text-yellow-400 text-bold">Type</span> <span className="text-white">of chat :</span> </div>
         
         <div className="flex h-1/6 bg-white  rounded-full  my-2 w-2/3 items-center justify-center text-mine-480 
            hover:text-white hover:bg-green-600" onClick={handlePublicClick}> Public
        
        </div>

         <div className="flex h-1/6 bg-white  rounded-full  my-2 w-2/3 items-center justify-center text-mine-480  hover:text-white hover:bg-orange-600"> protected </div>
         <div className="flex h-1/6 bg-white  rounded-full  my-2 w-2/3 items-center justify-center text-mine-480  
             hover:text-white hover:bg-red-700"> private </div>
        
        
      </div>
      : <RoomModel/> } 
      </>

    );
}
export default CreateRoom;

export function RoomModel(type:any)
{
    return(
    <div className="flex flex-col h-3/4 w-full md:w-2/4 text-center items-center justify-center bg-black text-mine-490 text-3xl p-4">
      <div className="flex-grow">
        <div className="flex-col">
          <span className="text-yellow-400 text-bold">Public</span>{' '}
          <span className="text-white">Chat Settings:</span>
        </div>
      </div>
      <div className="flex flex-row w-4/6 h-3/6">
        <div className="flex h-1/6 text-2xl m-3 p-3 bg-white rounded-full my-2 w-2/3 items-center justify-center text-mine-480">
          Room name:
        </div>
        <input
          placeholder="Room Name"
          className="flex h-1/6 m-3 p-3 bg-white rounded-full my-2 w-5/6 items-center justify-center text-mine-480"
        />
      </div>
      <div className="flex flex-row w-4/6 h-1/6">
        <div className="flex h-2/6 text-2xl m-3 p-3 bg-mine-490 rounded-full my-2 w-2/3 items-center justify-center text-mine-480">NEXT</div>
        <div className="flex h-2/6 text-2xl m-3 p-3 bg-red-400 rounded-full my-2 w-2/3 items-center justify-center text-mine-480">CANCEL</div>
      </div>
    </div>
    );
}


