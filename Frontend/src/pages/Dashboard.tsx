import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Dashboard = () => {
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

export default Dashboard;