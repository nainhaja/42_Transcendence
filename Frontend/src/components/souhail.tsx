import React from "react";
import { Link, Outlet } from "react-router-dom";
// import Sidebar from "./Sidebar";
import avatar1 from "./Assets/Ellipse_213.png";
import avatar2 from "./Assets/Ellipse_214.png";
import avatar3 from "./Assets/Ellipse_215.png";
import avatar4 from "./Assets/Ellipse_216.png";
import fireIcon from "./Assets/fire.png";
import collection from "./Assets/collection.png";
import collection2 from "./Assets/collection2.png";
import collection3 from "./Assets/collection3.png";
import { useState, useEffect } from 'react';

import axios from 'axios';
// import React from "react";
import logo from "./Assets/logo.png";
import './../index.css';
import './../App.css';

import sideBarImg from "./Assets/Rectangle_363.png";
import { RxDashboard } from "react-icons/rx";
import { AiOutlineAlignLeft } from "react-icons/ai"
import { TbAdjustmentsHorizontal, TbFileSettings } from "react-icons/tb";
import { HiUserCircle, HiChatAlt2 } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { RiLogoutCircleRLine } from "react-icons/ri";
import fireEmoji from './Assets/fire-emoji.png'
import { FiSearch } from "react-icons/fi";
import Spectator from "./spectator_mod";
import Spect from "./spectator";
import History from "./history";
import { BiHeart } from 'react-icons/bi'



export const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center whitespace-nowrap">
      {/* -------- logo --------- */}
      <div>
        <img src={logo} alt="logo" />
      </div>
      {/* ---------- nav list -------- */}
      <div className="mt-[108px]">
        <ul className="flex flex-col gap-[43px]">
          <li
            onClick={() => navigate("/")}
            className="flex items-center gap-[14px] cursor-pointer"
          >
            <span className="text-[24px]">
              <RxDashboard />
            </span>
            <span className="text-[18px]">Dashboard</span>
          </li>
          <li
            onClick={() => navigate("/settings")}
            className="flex items-center gap-[14px] cursor-pointer"
          >
            <span className="text-[24px]">
              <TbFileSettings />
            </span>
            <span className="text-[18px]">Settings</span>
          </li>
          <li onClick={() => navigate("/chat")}
          className="flex items-center gap-[14px] cursor-pointer">
            <span className="text-[24px]">
              <HiChatAlt2 />
            </span>
            <span className="text-[18px]">Chat</span>
          </li>
          <li onClick={() => navigate("/addfriend")} 
          className="flex items-center gap-[14px] cursor-pointer">
            <span className="text-[24px]">
              <BiHeart />
            </span>
            <span className="text-[18px]">Add friends</span>
          </li>
          <li
            onClick={() => navigate("/profile")}
            className="flex items-center gap-[14px] cursor-pointer"
          >
            
            <span className="text-[24px]">
              <HiUserCircle />
            </span>
            <span className="text-[18px]">Profile</span>
          </li>
        </ul>
      </div>

      {/* ------ ad section ------ */}
      <div className="mt-[140px]">
        <img
          className="w-[171px] h-[171px] object-contain rounded-[10px]"
          src={sideBarImg}
          alt="ad"
        />
      </div>

      {/* ------- logout button ------- */}
      <div className="mt-[63px]">
        <button className="flex items-center text-[#EB5757] font-[500] gap-[1rem]">
          <RiLogoutCircleRLine /> LOGOUT
        </button>
      </div>
    </div>
  );
};


const fakeData = [
    {
      img: avatar1,
      title: "Pomaline Yemare",
      subTitle: "@Poma3",
      pts: "1987 pts",
    },
    {
      img: avatar2,
      title: "Pomaline Sunny",
      subTitle: "@Poma1",
      pts: "1987 pts",
    },
    {
      img: avatar3,
      title: "Leinard Studio",
      subTitle: "@Leinard",
      pts: "1987 pts",
    },
    {
      img: avatar4,
      title: "Okoro Pleple",
      subTitle: "@Omope",
      pts: "1987 pts",
    },
  ];

export const Dashboard = () => {
  return (
    <div className="flex h-screen  w-full scrollbar-hide overflow-y-scroll ">
      {/* ------- SIDEBAR ---------- */}
      <div className="w-14 flex h-full flex-col items-center justify-between bg-black lg:hidden md:hidden">
        <div className="m-3 w-10 h-10 bg-black">
          <img src='logo.svg' alt="emmm" />
        </div>
        <div className="flex flex-col m-3 w-10">
          <img className="py-3 w-9" src='dashboard.svg' alt="emmm" />
          <img className="py-3 w-9" src='settings.svg' alt="emmm" />
          <img className="py-3 w-9" src='addfriends.svg' alt="emmm" />
          <img className="py-3 w-9" src='Chats.svg' alt="emmm" />
          <img className="py-3 w-9" src='profile.svg' alt="emmm" />
        </div>
        <div className="mb-3">
          <img className="py-3 w-9" src='logout.svg' alt="emmm" />
        </div>
      </div> 


      <div className="w-1/6  lg:flex md:flex hidden overflow-y-scroll bg-black scrollbar-hide">
        <div className="flex flex-grow items-center justify-center bg-black w-1/6  text-white">
          <Sidebar />
        </div>
      </div>
      {/* ------- OUTLET ---------- */}
      <div className=" sm:flex-wrap flex flex-grow py-6 w-2/6 bg-[#1a1b26] align-center items-start  justify-start flex-col scrollbar-hide overflow-y-scroll">
        {/* <div className=" bg-cyan-600 my-5 sm:hidden lg:hidden ">
          <AiOutlineAlignLeft/>
        </div> */}
        <Outlet />
      </div>
    </div>
  );
};

// export default Dashboard;



 export const Achievments = () => {
  return (
    <div className=" bg-[#262626] px-[32px] py-[19px] rounded-[20px]">
      <h1 className="text-[24px] mb-[12px] font-[600] text-white tracking-wider ">
        Leaderboard
      </h1>
      <div className="flex flex-col gap-[1rem]">
        {fakeData?.map((el) => (
          <div className="flex items-center justify-between">
            {/* ----- left side ---- */}
            <div className="flex items-center gap-[14px]">
              <div>
                <img
                  className="w-[60px] h-[60px] object-contain"
                  src={el?.img}
                  alt={el?.title}
                />
              </div>
              <div className="truncate">
                <h1 className="text-[14px] text-[#F2F2F2] font-[500]">
                  {el?.title}
                </h1>
                <h6 className="text-[13px] text-[#828282]">
                  {el?.subTitle}
                </h6>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



export const Leaderboard = () => {
  const [Leaderboard, setLeaderboard] = useState(Array<any>)
  useEffect(() => {
    axios.get('http://localhost:5000/user/leaderboard', {withCredentials: true})
    .then((response) =>{
      setLeaderboard(response.data)
    })
  },[])
  return (
    <div className="  h-[371px]  bg-[#262626] px-[32px] py-[19px] rounded-[20px]">
      <h1 className="lg:text-xl  md:text-xl mb-[12px] font-[600] text-white tracking-wider">
        Leaderboard
      </h1>
      <div className="flex flex-col gap-[1rem]">
        {Leaderboard.map((item, index) => (
          <div className="flex items-center justify-between">
            {/* ----- left side ---- */}
            <div className="flex items-center gap-[21px]">
              <div>
                <img className="w-[60px] h-[60px] object-contain" src={item.avatar} alt={item.username} />
              </div>
              <div>
                <h1 className="text-[15px] text-[#F2F2F2] font-[500] tracking-wider">{item.username}</h1>
                <h6 className="text-[14px] text-[#828282] tracking-wider">{item.username}</h6>
              </div>
            </div>
            {/* ---- right side ---- */}
            <div>
              <div className="flex items-center gap-[14px]">
                <img src={fireIcon} alt="fire icon" />
                <h6 className="text-[13px] tracking-wider text-[#F2F2F2]">{item.score}</h6>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// import p5 from 'p5';


interface GameState {
    // Game variables
    width: number;
    height: number;
    aspectRatio: number;

    ball_x: number;
    ball_y: number;
    ball_direction_x: number;
    ball_direction_y: number;
    ball_radius: number;

    fr_paddle_x: number;
    fr_paddle_y: number;
  
    sec_paddle_x: number;
    sec_paddle_y: number;
  
    paddle_width: number;
    paddle_height: number;

    state: string; // "waiting" | "play" | "scored" | "endGame"
    players : Array<string>;
    players_avatar : Array<string>;
    players_names : Array<string>;
    spectators: Array<string>;

    scores: Array<number>;
    score_limit : number;
    winner : string;
    lastscored: string;
}

export type {GameState};

interface GameCount {
    count: number;
}

export type {GameCount}

const fakeDataa = [
  { img: collection, title: "Abstrac Girl", link: "/game/1" },
  { img: collection2, title: "Beautiful Flower", link: "/game/2" },
  { img: collection3, title: "Abstrac Color", link: "/game/3" },
];

export const MyCollection = () => {
  return (
    <div className="flex-wrap">
      <h1 className="text-[21px] text-white font-[600] mb-[15px]">
        My collection
      </h1>
      <div className="flex gap-5  flex-row">
        {fakeDataa?.map((el) => (
          
          <Link to={el?.link} className="lg:w-9/12 md:w-9/12  h-[272px] flex flex-col items-center bg-[#262626] rounded-[10px]">
            <img
              className="w-[174px] h-[182px] object-contain mt-[4px]"
              src={el?.img}
              alt={el?.title}
            />
            <h1 className="mt-[23.83px] text-[#ECEBF6] font-[500] tracking-wider">{el?.title}</h1>
        
          </Link>
        ))}
      </div>
    </div>
  );
};


export const MyGames = () => {

  //

    return ( <Spect/>
    
       
  );
};


export const Home = () => {
    return (
      <div className="flex flex-col sm:flex-wrap w-full justify-center items-center">
        {/* ------- top section ------- */}
        <div className="flex">
          {/* ------- search input -------- */}
          <div className="flex">
            <span className="bg-[#E8E8E8] px-[30px] rounded-l-[10px] flex justify-center items-center cursor-pointer">
              <FiSearch className="text-[#7B7B7B] text-[1.5rem]" />
            </span>
            <input
              className="grow h-10 bg-[#E8E8E8] text-[#7B7B7B] text-[14px]"
              type="text"
              placeholder="Search items, collections, and users"
            />
            <span className="bg-[#E8E8E8] px-[30px] rounded-r-[10px] flex justify-center items-center cursor-pointer">
              <TbAdjustmentsHorizontal className="text-[#7B7B7B] text-[1.5rem]" />
            </span>
          </div>
        </div>
        {/* ---------- upper part -------- */}
        <div className="flex items-center gap-x-10 justify-center mt-8 flex-wrap gap-6 w-8/12">
          <MyCollection />
          <Leaderboard />
        </div>
        {/* ----------- bottom part ---------- */}
        <div className="flex items-center justify-center gap-[44px] mt-[36px] flex-wrap w-full">
          <MyGames />
          <Achievments />
        </div>
      </div>
    );
  };