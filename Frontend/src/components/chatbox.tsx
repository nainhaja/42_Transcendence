import React, { useEffect, useRef, useState } from 'react';

import MessageContact, { Message } from './ChatBoxComponents/Message';

import NavBarmessage from './ChatBoxComponents/NavBarmessage';

function ChatBox(props: any) 
{

  
  const [chatmsgs, setchatmsgs] = useState<any>([]);
  const inputRef = useRef<any>(null);
  const sendMesg = () => {
    // emit to chat getway mesg sent
    if (inputRef != null) {
      var msg = inputRef.current.value;
      console.log(msg);
      if (msg !== "") {
        const newMsg = {
          id: 1,
          user: "Ayajrhou",
          msg: msg,
          Date: '00:00',
        };
        setchatmsgs([...chatmsgs, newMsg])
        if (inputRef.current)
          inputRef.current.value = ""
      }
    }
  }

  useEffect(() => {
    if (props.sectionMsgsData != null) setchatmsgs(props.sectionMsgsData)
  }, [props.sectionMsgsData])

  return (
   

    <div className="h-full flex-grow flex flex-col">
      <div className="w-full h-18 bg-mine-480 justify-between flex">

      {chatmsgs[0] ? (
    <NavBarmessage ProfilePic={chatmsgs[0].ProfilePic} user={chatmsgs[0].user} />
      ) : null}
  

      </div>


      <div className="w-full flex-grow bg-mine-470 overflow-scroll">
        {
          chatmsgs.map((item: any) => {
            if (item.user === "Ayajrhou")
              return <Message msg={item.msg} user={item.user} />
            return <MessageContact ProfilePic={item.ProfilePic} msg={item.msg} user={item.user} />
          })
        }
        {/* <MessageContact />
              <Message /> */}
      </div>
      <div className="w-full h-20 flex px-10 bg-black">
        <input ref={inputRef} placeholder="Type your message... " type="text" className="rounded-full mr-48 flex-grow my-4 p-4 focus:outline-none bg-gray-600 "></input>
        <div onClick={sendMesg} className="rounded-full flex my-4 p-4 mr-12  bg-mine-470  text-mine-490 hover:bg-mine-490 hover:text-mine-470 ">Send message</div>
      </div>
    </div>
  );
}


export default ChatBox;


export const ChatComp = ( msg:any, user:any ) => {
  return (
    <div>

    </div>
  );
}

