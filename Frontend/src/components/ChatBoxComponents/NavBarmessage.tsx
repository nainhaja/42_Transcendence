
import React from "react";
// import ProfilePicture from '../../resources/profilepicture.jpeg';

export function NavBarmessage(props:any)
{
    return(
    <div className="flex items-center">
        <div className="p-2">
          <img src={props.ProfilePic} className="h-16 w-16 rounded-full"></img>
          <div className="flex justify-center items-center w-3 h-3 relative left-6 bottom-3 bg-white">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="p-2">
          <div className="text-xl text-gray-500 ">{props.user}</div>
        </div>

        <div className="flex items-center p-3 right-0 absolute">
          <img src='more.svg' className="w-5 h-5  "></img>
        </div>
    </div>
    );
}

export default NavBarmessage;