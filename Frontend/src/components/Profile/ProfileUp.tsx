import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Navigate ,useNavigate} from 'react-router-dom'
import { StringLiteral } from "typescript";
import avatar1 from "../../Assets/Ellipse 213.png";
import fireIcon from "../../Assets/fire.png";
import { main_socket_context } from "../sockets";
//import {Usercontext} from "../../context/Usercontext"



const ProfileUp = () => {
  const navigate = useNavigate();

  const shkon = window.location.pathname.split("/",3)[2];
  const main_socket = useContext(main_socket_context);
  console.log("HEHE"+ shkon);
  let url:string ;
  if (shkon)
    url = "http://localhost:5000/user/user/" + shkon;
  else
    url = "http://localhost:5000/user/user"
 
  const [User, SetUser] = useState<any>({});
  const [me, itsme] = useState(false);

  function ButtonisPressed()
  {
    console.log("M3lem mqwda alik a 3chiri "+User.username)
    main_socket.emit("invite_game", {player1: User});
    //main_socket.emit("invite_game")
  }

  useEffect(() => {
    axios.get(url, {withCredentials: true})
    .then((response) =>{
        console.log("nigga" + response.status)
        SetUser(response.data);
      }).catch(error => 
        {  
          console.log("nigga" + error.response.status)
          navigate("/errornotfound");
        });
  },[])

return (
  <div className="flex items-center justify-center gap-[120px]">
    <div>
    <div className="flex items-center gap-[40px]">
      <div>
        <img
          className="w-[140px] h-[140px] object-contain"
          src={User.avatar}
          alt="avatar"
        />
      </div>
      <div>
        <h1 className="text-[24px] font-[500] tracking-wider text-[#F2F2F2]">
          {User.username}
        </h1>
        <h6 className="text-[#828282] text-[20px] tracking-wider">@Zodiac</h6>
      </div>
    </div>
    <div className="h-fit px-[27px] py-[21px] flex items-center gap-[40px] bg-[#262626] rounded-[20px]">
      <h1 className="text-[24px] text-white">
        Current <span className="text-[#ECCC6B]">Score</span> :
      </h1>
      <div className="flex items-center gap-[1rem]">
        <img src='../../Assets/fire.png' alt="fire" />
        <h1 className="text-[22px] text-white">
          5734 <span className="text-[#ECCC6B]">PTS</span>
        </h1>
      </div>
    </div>
    </div>
      <button
              onClick={ButtonisPressed}
              type="button" 
              className="transition duration-300 ease-in-out align-center w-full justify-center items-center"
            > 
          Invite To A Game
      </button>
</div>
);
};

export default ProfileUp;
