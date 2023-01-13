import React from "react";
import logo from "./logo.png";
import sideBarImg from "./Rectangle_363.png";
import { RxDashboard } from "react-icons/rx";
import { TbFileSettings } from "react-icons/tb";
import { HiUserCircle, HiChatAlt2 } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { BiHeart } from 'react-icons/bi'

const Sidebar = () => {
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

export default Sidebar;