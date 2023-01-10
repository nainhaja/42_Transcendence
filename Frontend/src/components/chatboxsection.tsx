import React, { useEffect } from 'react';
// import ProfilePicture from '../resources/profilepicture.jpeg';
import ProfilePic from './ChatSectionComponents/ProfilePic'
import LastMessage from './ChatSectionComponents/LastMessage';
import Date from './ChatSectionComponents/Date';
import UserName from './ChatSectionComponents/UserName';

// import ParentComponent from './parentcomponent';

// react router doom
// <Link> navigate() usLocation() "router switch"
// <Route> path="/chat/*" component="render" "router switch"
// resquest to backend ~it only needs a room id~ which we can get trough the react router doom api 
// request return messages and room details
// render messages and room details

function ChatBoxSection(props:any) {


  return (
    <div  onClick={props.onClick} > 
      <div className="flex m-3 rounded-lg p-2 hover:bg-gray-500 bg-gray-800 ">
        <ProfilePic ProfilePic={props.ProfilePic}/>
        <div className="flex-grow p-3">
          <div className="flex text-sm text-white justify-between">
            <UserName UserName={props.UserName}/>
            <Date Date={props.Date}/>
          </div>
          <LastMessage LastMessage={props.LastMessage}/>
        </div>
      </div>
    </div>
  );
}

export default ChatBoxSection;