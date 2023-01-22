import axios from "axios";
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import fireIcon from "../Assets/fire.png";



const AddFriend = () =>
{
 
    const[Friends, setFriends] = useState (Array<any>);
    const [Username, setUsername] = useState("");
    const [avatar, setAvatar] = useState('');
    const navigate = useNavigate();
    const handleredirect = (username: string) =>
  {
    navigate("/profile/" + username);
  }
    useEffect(() => {
        axios.get('http://localhost:5000/user/friends', {withCredentials: true})
        .then((res) => {
            setFriends(res.data);
        }).catch((err) =>
        {
            window.alert("Unable To Fetch Your Friends");
        })
    })
    return (
        <div className="w-[433px] h-[371px] bg-[#262626] px-[32px] py-[19px] rounded-[20px]">
          <h1 className="text-[24px] mb-[12px] font-[600] text-white tracking-wider">
            friends
          </h1>
          <div className="flex flex-col gap-[1rem]">
            {Friends.map((item, index) => (
              <div className="flex items-center justify-between" onClick={() => {handleredirect(item.username)}}>
                {/* ----- left side ---- */}
                <div className="flex items-center gap-[21px]">
                  <div>
                    <img className="w-[60px] h-[60px] object-contain" src={item.avatar} alt={item.full_name} />
                  </div>
                  <div>
                    <h1 className="text-[15px] text-[#F2F2F2] font-[500] tracking-wider">{item.full_name}</h1>
                    <h6 className="text-[14px] text-[#828282] tracking-wider">{item.username}</h6>
                  </div>
                </div>
                {/* ---- right side ---- */}
                <div>
                  <div className="flex items-center gap-[14px]">
                    <img src={fireIcon} alt="fire icon" />
                    <h6 className="text-[13px] tracking-wider text-[#F2F2F2]">{item.status}</h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
}
export default AddFriend;