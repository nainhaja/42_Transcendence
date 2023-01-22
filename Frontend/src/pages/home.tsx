import React from "react";
import MyCollection from "../components/Home/MyCollection";
import { FiSearch } from "react-icons/fi";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import Leaderboard from "../components/Home/Leaderboard";
import MyGames from "../components/Home/MyGames";
import Achievments from "../components/Home/Achievments";
import Searchbar from "../components/Searchbar";

const Home = () => {
  return (
    <div>
      {/* ------- top section ------- */}
      <div>
        {/* ------- search input -------- */}
        <div className="w-[593px] h-[52px] flex">
          <span className="bg-[#E8E8E8] px-[30px] rounded-l-[10px] flex justify-center items-center cursor-pointer">
            <Searchbar />
          </span>
          <input
            className="grow h-[100%] bg-[#E8E8E8] text-[#7B7B7B] text-[14px]"
            type="text"
            placeholder="Search items, collections, and users"
          />
          <span className="bg-[#E8E8E8] px-[30px] rounded-r-[10px] flex justify-center items-center cursor-pointer">
            <TbAdjustmentsHorizontal className="text-[#7B7B7B] text-[1.5rem]" />
          </span>
        </div>
      </div>
      {/* ---------- upper part -------- */}
      <div className="flex items-center gap-[66px] mt-[72px]">
        <MyCollection />
        <Leaderboard />
      </div>
      {/* ----------- bottom part ---------- */}
      <div className="flex items-center gap-[44px] mt-[36px]">
        <MyGames />
        <Achievments />
      </div>
    </div>
  );
};

export default Home;
