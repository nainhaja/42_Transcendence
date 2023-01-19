import React from "react";
import Sketch from "react-p5";
import p5Types from "p5";

import P5Wrapper from 'react-p5';
import p5 from 'p5';
import { Paddle } from "./Lobby"
import { GameState } from "./Ball"
import { ReactP5Wrapper } from "react-p5-wrapper";
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from "socket.io-client";
import { useSearchParams } from "react-router-dom";
import { stat } from "fs";
import './../index.css';
import './../App.css';
interface live_games {
    count: number;
}

interface for_spect 
{
  user_1_name: string;
  user_2_name: string;

  user_1_score: number;
  user_2_score: number;
  
  user_1_avatar: string;
  user_2_avatar: string;
}


const Spect = () => {

  const socket = useRef(null as null | Socket);
  const my_live_games = useRef(null as null | live_games);
  const [state, setState] = useState("waiting");
  const [Cpt, setCpt] = useState(0);

  const gameState = useRef(null as null | GameState);
  const spect_array = useRef(null as null |  Array<for_spect>);

  const [user_arr, setUserone_ar] = useState(Array<for_spect>);

  //  const [user_one, setUserone] = useState(Array<string>);
  //  const [user_two, setUsertwo] = useState(Array<string>);
 
  //  const [user_one_score, setUserone_score] = useState(Array<number>);
  //  const [user_two_score, setUsertwo_score] = useState(Array<number>);
 
  //  const [user_one_name, setUserone_name] = useState(Array<string>);
  //  const [user_two_name, setUsertwo_name] = useState(Array<string>);

  const [my_width, setWidth] = useState(window.innerWidth);
  const [m_height, setHeight] = useState(window.innerHeight);

  const getWindowSizee = () => {
    const { innerWidth, innerHeight } = window;
    return { innerWidth, innerHeight };
  }




  let ok = 0;
  let hh = 0;
  let yarb = 0;
  const [live_qs, setLayhfdk] = useState(0);
  let button_cpt = 0;
  let buttons: p5.Element[] = [];

  let aspectRatio: number = 0;

  let absoluteWidth: number = 0;
  let relativeWidth: number = 0;

  let absoluteHeight: number = 0;
  let relativeHeight: number = 0;

  let scalingRatio: number = 0;

  function buttonPressed(nbr: number) {
    if (spect_array.current != null)
    {
      setUserone_ar(spect_array.current);

        // setUserone(gameState.current.players_avatar[0]);
        // setUsertwo(gameState.current.players_avatar[1]);
    

        // setUserone_score(gameState.current.scores[0]);
        // setUsertwo_score(gameState.current.scores[1]);

        // setUserone_name(gameState.current.players_names[0]);
        // setUsertwo_name(gameState.current.players_names[1]);

    }
  }

  useEffect(() => {
    socket.current = io("http://localhost:4000").on("connect", () => {

      
      socket.current?.on("gameCount", (data: Array<for_spect>) => {
        spect_array.current = data;
        
        if (spect_array.current)
        {
          setUserone_ar(spect_array.current);
         // console.log("Length is "+spect_array.current.length);
          //console.log("user 1 name is "+spect_array.current[spect_array.current.length - 1].user_1_name);
          let len_x = spect_array.current?.length;
          setLayhfdk(+len_x);
        }
          
       // 
      });
      setState("started watching");
      //socket.current?.emit("spectJoin", {value: -1});
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
  }

  function draw(p5: p5Types)
  {
    socket.current?.emit("spectJoined");
    setState("started watching");
    socket.current?.emit("spectJoin", {value: -1});
    if (spect_array.current != null)
    {
      
      setUserone_ar(spect_array.current);
     // console.log("Wech a 3chiri ", user_arr[0].user_1_avatar);
        // setUserone(gameState.current.players_avatar[0]);
        // setUsertwo(gameState.current.players_avatar[1]);
    

        // setUserone_score(gameState.current.scores[0]);
        // setUsertwo_score(gameState.current.scores[1]);

        // setUserone_name(gameState.current.players_names[0]);
        // setUsertwo_name(gameState.current.players_names[1]);

    }

  }

  function Watching()
  {

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
        ))
        }
      

     
    </div>
    </div>
}</>);



 
};


export default Spect;
