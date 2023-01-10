import React from "react";


function ProfilePic(props:any )
{
    return (
        <div>
          <img className="w-14 h-14 rounded-full" src={props.ProfilePic} alt="intrapic"></img>
        </div>
    );
}
export default ProfilePic;