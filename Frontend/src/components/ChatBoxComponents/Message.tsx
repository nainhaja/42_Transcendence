import React from "react";
function MessageContact(props: any) {
    return (
        <div className="flex w-3/6 m-10" >
                <img src={props.ProfilePic} className= "w-16 h-16 rounded-full m-5"></img>
                <div className="p-3 bg-mine-490 rounded-lg">
                  <div className="text-2xl text-mine-480">
                    {props.user}
                  </div>
                  <div className="text-x text-gray-600">
                    {props.msg}
                  </div>
                  <div className="text-xs text-gray-500 float-right ">
                    12:00
                  </div>
                </div>
              </div>
    );
}

export default MessageContact;
export function Message(props: any) {
    return (
        <div className="flex justify-end">

        <div className="flex m-10" >
        <div className="p-3 bg-mine-500 rounded-lg">
          <div className="text-2xl text-mine-480">
          {props.user}

          </div>
          <div className="text-x text-gray-600">
          {props.msg}
          </div>
          <div className="text-xs text-gray-500 float-left ">
            12:00
          </div>
        </div>
        {/* <img src={ProfilePicture} className= "w-16 h-16 rounded-full m-5"></img> */}
      </div>
      </div>
    );
}

//axios 
