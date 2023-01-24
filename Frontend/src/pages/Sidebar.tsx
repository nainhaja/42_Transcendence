import React, { useState } from "react";
import logo from "../Assets/logo.png";
import sideBarImg from "../Assets/Rectangle 363.png";
import { RxDashboard } from "react-icons/rx";
import { TbFileSettings } from "react-icons/tb";
import { HiUserCircle, HiChatAlt2 } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { BiHeart } from "react-icons/bi";
import axios from "axios";
import { useDispatch } from "react-redux";
import { logout } from "../reducers/UserSlice";
import { useSpring, animated } from '@react-spring/web'

const Sidebar = () => {
  const navigate = useNavigate();
  const [off, setoff] = useState(false);

  const dispatch = useDispatch();

  const handle_logout = () => {
    setoff(true);
    let res = axios
      .post(
        "http://localhost:5000/user/logout",
        { off },
        { withCredentials: true }
      )
      .then((response) => {
        window.alert("You have logged out !see You later");
        navigate("/login");
        dispatch(logout());

      });
  };
  const gohome = () =>{
    navigate("/")
  }
  const [isHovered, setIsHovered] = useState(false);
  const animationProps = useSpring({
    transform: isHovered? 'scale(1.25)' : 'scale(1)',
    from:{
      transform: 'scale(1)'
    }
  });
  const handleMouseEnter = () =>setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
 
  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="flex flex-col items-center  whitespace-nowrap text-white">
      {/* -------- logo --------- */}
      <div>
        <animated.img style={animationProps} src={logo} alt="logo" onClick={gohome} />
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
          <li
            onClick={() => navigate("/chat")}
            className="flex items-center gap-[14px] cursor-pointer"
          >
            <span className="text-[24px]">
              <HiChatAlt2 />
            </span>
            <span className="text-[18px]">Chat</span>
          </li>
          <li
            onClick={() => navigate("/friends")}
            className="flex items-center gap-[14px] cursor-pointer"
          >
            <span className="text-[24px]">
              <BiHeart />
            </span>
            <span className="text-[18px]">friends</span>
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
        <button
          className="flex items-center text-[#EB5757] font-[500] gap-[1rem]"
          onClick={handle_logout}
        >
          <RiLogoutCircleRLine /> LOGOUT
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

