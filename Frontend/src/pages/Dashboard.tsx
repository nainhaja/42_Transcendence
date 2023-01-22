import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  return (
    <div className="flex">
      {/* ------- SIDEBAR ---------- */}
      <div className="min-w-[253px]">
        <div className="sticky left-0 top-0 w-[253px] min-h-[1023px] px-[71px] pt-[38px] bg-black ">
          <Sidebar />
        </div>
      </div>
      {/* ------- OUTLET ---------- */}
      <div className="min-w-[1021px] grow min-h-screen bg-[#1a1b26] pl-[52px] pr-[22px] pt-[22px] pb-[67px]">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;