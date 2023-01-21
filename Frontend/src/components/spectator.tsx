import React from "react";
import Sketch from "react-p5";
import p5Types from "p5";

import { GameState } from "./Ball"
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from "socket.io-client";
import './../index.css';
import './../App.css';
import axios from "axios";

interface for_spect 
{
  user_1_name: string;
  user_2_name: string;

  user_1_score: number;
  user_2_score: number;
  
  user_1_avatar: string;
  user_2_avatar: string;

  index: number;

}


const Spect = () => {

  const socket = useRef(null as null | Socket);
  const [state, setState] = useState("waiting");
  const gameState = useRef(null as null | GameState);
  const spect_array = useRef(null as null |  Array<for_spect>);
  const [user_arr, setUserone_ar] = useState(Array<for_spect>);
  const [live_qs, setLayhfdk] = useState(0);
  const [User, SetUser] = useState<any>({});
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    axios.get("http://10.12.2.1:5000/user/user", {withCredentials: true})
    .then((response) =>{
        console.log("nigga" + response.status)
        SetUser(response.data);
      }).catch(error => 
        {  
          console.log("nigga" + error.response.status)
        });
      
    socket.current = io("http://10.12.2.1:4000").on("connect", () => {
      socket.current?.on("gameCount", (data: Array<for_spect>) => {
        spect_array.current = data;
        
        if (spect_array.current)
        {
          setUserone_ar(spect_array.current);
          let p=0;
          for(let p=0;p< spect_array.current.length ; p++)
          {
            if (spect_array.current[p].user_1_name === User.username || spect_array.current[p].user_1_name === User.username)
            {
              setIndex(spect_array.current[p].index);
              break;
            }
          }
 
          let len_x = spect_array.current?.length;
          setLayhfdk(+len_x);
        }
      });
      setState("started watching");
      socket.current?.on("queue_status", (data: GameState) => {
        gameState.current = data;
      });        




      return () => {
        socket.current?.removeAllListeners();
        socket.current?.close();
      }
    });
  }, [state, live_qs]);

  const setup = (p5: p5Types, canvasParentRef: Element) => 
  {
    p5.createCanvas(0, 0);
  }

  function draw(p5: p5Types)
  {

    socket.current?.emit("spectJoined");
    setState("started watching");
    socket.current?.emit("spectJoin", {value: -1});
    if (spect_array.current != null)
      setUserone_ar(spect_array.current);
  }

  return(<>
    
    <Sketch setup={setup} draw={draw} />
    {live_qs === 0 ?  <div
          className=" lg:h-[400px] md:h-[300px] sm:h-[200px]  w-5/12 px-[1.5rem] scrollbar-hide overflow-hidden overflow-y-scroll py-[1rem] rounded-[20px] flex flex-col bg-[#262626] text-white text-[24px] mb-[12px] font-[600]">
              <div className="overflow-y-hidden d-flex align-center text-center  justify-content-center">
                <div className="mx-auto "> NO CURRENT LIVE GAMES </div>
                <div className="">
                  <img className="w-2/4 h-1/4 mx-auto" src="2130248.png"></img>
              </div>
              </div>
              </div>:
      <div className="lg:w-5/12 lg:h-3/12 w-5/12 flex flex-col">
        
        <div
        className=" h-3/12 px-[1.5rem] scrollbar-hide overflow-hidden overflow-y-scroll py-[1rem] rounded-[20px] flex flex-col  bg-[#262626] text-white text-[24px] mb-[12px] font-[600]"> 
        {Array.from({ length: live_qs}, (v, i) => i + 1).map(i => (
          <>
          {index === i ? 
            <a href={`/watch/${i}`} className=" bg-[#1F9889] flex flex-row  rounded-full  text-base my-5 items-center hover:bg-[#C66AE1] text-center">
            
                <div className="h-5/6 w-6/12 flex  flex-row text-white text-base text-center">
                    <img className="rounded-full w-4/12" src={user_arr[i - 1].user_1_avatar}></img>
                    <div className="">{user_arr[i - 1].user_1_name}</div>    
                </div>

                <div className="h-3/6 w-1/12  flex flex-center text-base justify-center items-center text-white bg-black my-3 rounded-xl"> {user_arr[i - 1].user_1_score} - {user_arr[i - 1].user_2_score}</div>
                
                <div className="h-5/6 w-6/12 flex justify-end flex-row text-white text-base text-center">
                        <div className="">{user_arr[i - 1].user_2_name}</div>
                        <img className="rounded-full w-4/12" src={user_arr[i - 1].user_2_avatar}></img>
                </div>
            </a>
            :
            <a href={`/game/${index}`} className=" bg-[#1F9889] flex flex-row  rounded-full  text-base my-5 items-center hover:bg-[#C66AE1] text-center">
            
            <div className="h-5/6 w-6/12 flex  flex-row text-white text-base text-center">
                <img className="rounded-full w-4/12" src={user_arr[i - 1].user_1_avatar}></img>
                <div className="">{user_arr[i - 1].user_1_name}</div>    
            </div>

            <div className="h-3/6 w-1/12  flex flex-center text-base justify-center items-center text-white bg-black my-3 rounded-xl"> {user_arr[i - 1].user_1_score} - {user_arr[i - 1].user_2_score}</div>
            
            <div className="h-5/6 w-6/12 flex justify-end flex-row text-white text-base text-center">
                    <div className="">{user_arr[i - 1].user_2_name}</div>
                    <img className="rounded-full w-4/12" src={user_arr[i - 1].user_2_avatar}></img>
            </div>
            </a>
            }
            </>
        ))
        }
    </div>
    </div>
}</>);

};


export default Spect;
