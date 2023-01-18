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

const History = () => {

  const socket = useRef(null as null | Socket);
  const my_live_games = useRef(null as null | live_games);
  const [state, setState] = useState("waiting");
  const [Cpt, setCpt] = useState(0);

   const gameState = useRef(null as null | GameState);

   const [user_one, setUserone] = useState("");
   const [user_two, setUsertwo] = useState("");
 
   const [user_one_score, setUserone_score] = useState(0);
   const [user_two_score, setUsertwo_score] = useState(0);
 
   const [user_one_name, setUserone_name] = useState("");
   const [user_two_name, setUsertwo_name] = useState("");

  const [my_width, setWidth] = useState(window.innerWidth);
  const [m_height, setHeight] = useState(window.innerHeight);

  const getWindowSizee = () => {
    const { innerWidth, innerHeight } = window;
    return { innerWidth, innerHeight };
  }
  const [live_qs, setLayhfdk] = useState(0);

  useEffect(() => {
    socket.current = io("http://localhost:4000").on("connect", () => {

      
      socket.current?.on("gameCount", (data) => {
        setLayhfdk(+data);
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
    socket.current?.emit("History");
  }

  return(<>
    
    <Sketch setup={setup} draw={draw} />
</>);



 
};


export default History;
