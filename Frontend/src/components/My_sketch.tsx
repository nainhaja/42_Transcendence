import React from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import axios from 'axios';

import P5Wrapper from 'react-p5';
import p5 from 'p5';
import { Paddle } from "./Lobby"
import { GameState } from "./Ball"
import { ReactP5Wrapper } from "react-p5-wrapper";
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from "socket.io-client";
import { useSearchParams } from "react-router-dom";
import { stat } from "fs";
import  Spectator  from './spectator_mod';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BackGround from '../pages/background.jpg'


  
  // await axios.get( process.env.REACT_APP_BACKEND_URL+ "/chat/myChannels", 
  // {withCredentials: true} 
  // ).then((res)=>{
  //   var myChannels : Array<string> = [];
  //   for (let index = 0; index < res.data.length; index++) {
  //     myChannels.push(res.data[index].channelId);
  //   }
  //   myChannels.push(userLogin);
  //   // mychannels.pushback(userlogin)
  //   socket.emit('joinRoom', myChannels)
  // }).catch((err)=>{
  // })
  //}


const SketchPong = () => {

  const socket = useRef(null as null | Socket);
  const gameState = useRef(null as null | GameState);
  const [state, setState] = useState("waiting");
  const [Cpt, setCpt] = useState(0);
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



  let ok = 0;
  let hh = 0;
  let yarb = 0;
  const [layhfdk, setLayhfdk] = useState(0);
  let button_cpt = 0;
  let buttons: p5.Element[] = [];

  let aspectRatio: number = 0;

  let absoluteWidth: number = 0;
  let relativeWidth: number = 0;

  let absoluteHeight: number = 0;
  let relativeHeight: number = 0;

  let scalingRatio: number = 0;

  function buttonPressed(nbr: number) {
    button_cpt = 1;
    //console.log("nbr " + nbr);
    if (socket.current != null)
      socket.current.emit("spectJoin", { value: nbr });
    setState("started watching");
    //hh = c;
    //buttons.splice(0, c);
    //
  }


  useEffect(() => {


    socket.current = io("http://localhost:4000", {
      withCredentials: true,
    }).on("connect", () => {

    if (socket.current != null)
    {
        socket.current.on('gameCount', (data) => {
        hh = data;
        setLayhfdk(+ data);
        //console.log("wch a 3chiri " + layhfdk);
      });      
    }
    if (state == "play" && layhfdk === 0)
      socket.current?.emit("player_join_queue");
      else if (state == "spect")
      {

        socket.current?.emit("spectJoined");
        if (socket.current != null)
          socket.current.on('gameCount', (data) => {
            hh = data;
            setLayhfdk(+ data);
            //console.log("wch a 3chiri " + layhfdk);
          });
      }

      socket.current?.on("queue_status", (data: GameState) => {

        if (state == "waiting") {

        }
        gameState.current = data;
      });

      return () => {
        socket.current?.removeAllListeners();
        socket.current?.close();
      }
    });
  }, [state, layhfdk]);


  const setup_2 = (p5: p5Types,canvasParentRef: Element) => {
    p5.createCanvas(window.innerWidth/4 , (window.innerWidth / 8)).parent(canvasParentRef)

    p5.background(70);

  }

  function draw_2(p5: p5Types)
  {
    p5.resizeCanvas(window.innerWidth/2 , (window.innerWidth / 8))

    p5.background(70);
    function getWindowSize() {
      const { innerWidth, innerHeight } = window;
      return { innerWidth, innerHeight };
    }
    const player_names = (p5: p5Types) => {
      // this method will allow us to draw the score line of both players
      // we start of by filling the whole screen black 
      // we allign the text in the center and we can rectrieve the score of each players using the gamestate that is constantly
      //retrieving data from the backend of our code and then we display it
      // how to create as many buttons as i want based on a number 

      p5.fill(0);
      p5.textSize((getWindowSize().innerHeight * 20) / getWindowSize().innerHeight);
      p5.textAlign(p5.CENTER);
      //p5.resizeCanvas(getWindowSize().innerWidth, getWindowSize().innerHeight);
      //console.log(relativeHeight);
      if (gameState.current != null) {
        p5.text(
          gameState.current.players_names[0],
          (getWindowSize().innerWidth / 46) * 7,
          getWindowSize().innerWidth / 32
        );

        // p5.loadImage(gameState.current.players_avatar[0]);
        // p5.loadImage(gameState.current.players_avatar[1]);

        p5.text(
          gameState.current.players_names[1],
          (getWindowSize().innerWidth / 24) * 9,
          getWindowSize().innerWidth / 32
        );



      }

    };
    player_names(p5);

  }

  const setup = (p5: p5Types,canvasParentRef: Element) => {
    p5.createCanvas(window.innerWidth / 2, (window.innerWidth / 4)).parent(canvasParentRef)

    p5.background(122);

  }

  function User_avatar_one() {
    if (gameState.current != null)
      setUserone(gameState.current.players_avatar[0]);
    
     //console.log("heres my image"+ user_one);
    const imageLink = user_one;
  
    return (
      
        <img className="flex-grow" src={imageLink} alt="description of image" />
      
    );
  }

  function User_avatar_two() {
    if (gameState.current != null)
      setUsertwo(gameState.current.players_avatar[1]);
    
     //console.log("heres my image"+ user_one);
    const imageLink = user_two;
  
    return (
        <img className="flex-grow" src={imageLink} alt="description of image" />
    );
  }

  function Show_users_props() {
    if (gameState.current != null)
    {
      setUserone_score(gameState.current.scores[0]);
      setUsertwo_score(gameState.current.scores[1]);

      setUserone_name(gameState.current.players_names[0]);
      setUsertwo_name(gameState.current.players_names[1]);


    }
      
    
     //console.log("heres my image"+ user_one);
    const user_fr_score = user_one_score;
    const user_sec_score = user_two_score;

    const user_fr_name = user_one_name;
    const user_sec_name = user_two_name;
  
    return (
        <div className="flex flex-row justify-between bg-transparent w-2/4   md:h-16 lg:h-24 xl:h-32 sm:h-24 ">
        <div className="flex w-2/12 h-5/6 ">
          <User_avatar_one />
        </div>
        <div className="flex md:w-auto w-2/12 text-base hover:text-gray-600 text-white items-center justify-center bg-gray-600 my-8 rounded-full hover:bg-white">
          {user_fr_name}
        </div>
        <div className="flex md:w-auto w-2/12 text-base text-white items-center justify-center">
        {user_fr_score} - {user_sec_score}
        </div>
        <div className="flex md:w-auto w-2/12 text-base hover:text-gray-600 text-white items-center justify-center bg-gray-600 my-8 rounded-full hover:bg-white">
          {user_sec_name}
        </div>
        <div className="flex justify-between align-end w-2/12 h-5/6">
          <User_avatar_two />
        </div>
      </div>
    );
  }



  function draw(p5: p5Types) {
    
    function getWindowSize() {
      const { innerWidth, innerHeight } = window;
      return { innerWidth, innerHeight };
    }

    function get_window_height() {
      return getWindowSize().innerHeight;
    }
    if (gameState.current != null) {
      setUserone(gameState.current.players_avatar[0]);
      setUsertwo(gameState.current.players_avatar[1]);

      setUserone_score(gameState.current.scores[0]);
      setUsertwo_score(gameState.current.scores[1]);

      setUserone_name(gameState.current.players_names[0]);
      setUsertwo_name(gameState.current.players_names[1]);

      aspectRatio = gameState.current.aspectRatio;

      absoluteWidth = gameState.current.width;
      relativeWidth = getWindowSize().innerWidth / 2;


      absoluteHeight = absoluteWidth / aspectRatio;
      relativeHeight = (relativeWidth / aspectRatio);

      scalingRatio = relativeWidth / absoluteWidth;
      //console.log("MY section width is  " + relativeWidth + " my section height is " + relativeHeight);
    }

    p5.resizeCanvas(window.innerWidth /2 , window.innerWidth/4);
    p5.background(122);

    

    if (gameState.current != null) 
    {
      setUserone(gameState.current.players_avatar[0]);

      const drawClickToStartText = (p5: p5Types) => {
        if (gameState.current != null && socket.current != null) {
            

          let width = getWindowSize().innerWidth;
          let height = getWindowSize().innerHeight;
          if (gameState.current.state === "scored") {
            p5.fill(0);
            p5.textSize(((relativeWidth) / 35));
            p5.textAlign(p5.CENTER);
            const scores = gameState.current.scores;
            const scoresSum = scores[0] + scores[1];
            if (gameState.current.players.indexOf(socket.current.id) == -1) {
              // this is in case it's a spectator he can only watch without interfering in the game because his id couldn't be find 
              // in the players id array 
              p5.text("Waiting for players to start the game",
                (width) / 4,
                width / 16
              );
            }
            else {
              // in here both the players recieve text in the middle
              // the one who scored is displaying the waiting text while the other one the click enter
              // when he does click enter the ball gets respawned in the middle with the scores updated and the ball moving again
              // thus creating a new partido if you would call it that 

              p5.text(
                socket.current.id === gameState.current.lastscored
                  ? "Waiting for oponent to start the game"
                  : "Click enter to start the game ",
                (width) / 4,
                width / 16
              );
            }
          }
        }

      };

      

      //p5.clear();


      // if (gameState.current.state == "endGame")
      //   console.log("hana habibi");
      //console.log("Asbhan lah " + gameState.current.state);
      // p5.resizeCanvas(getWindowSize().innerWidth   , relativeHeight);
      // p5.background(122);
      //console.log("Plyaer name is "+gameState.current.players_names[0]);
      drawClickToStartText(p5);
      p5.fill(0);
      
     //player_names(p5);
      //console.log("Heres my aspect ratio " + aspectRatio);
      //the p5.rect method allows us to create a rectangle using the properties in the arguments x,y,width,heigh
      p5.rect(gameState.current.fr_paddle_x * scalingRatio, gameState.current.fr_paddle_y * scalingRatio, gameState.current.paddle_width * scalingRatio, gameState.current.paddle_height * scalingRatio);

      p5.rect(gameState.current.sec_paddle_x * scalingRatio, gameState.current.sec_paddle_y * scalingRatio, gameState.current.paddle_width * scalingRatio, gameState.current.paddle_height * scalingRatio);
      //the p5.circle method allows us to create a circle using the properties in the arguments x,y,Raduis
      p5.circle(gameState.current.ball_x * scalingRatio, gameState.current.ball_y * scalingRatio, gameState.current.ball_radius * scalingRatio);


      if (socket.current != null) {
        const handlePlayerOneInput = (p5: p5Types) => {
          // this is where we check for the first player's input and how he moves the paddles using W and S 
          // whenever he uses a key we emit an event called playerInput that will later on be received from the backend
          // when the backend recieved the emit he will update the paddles properties(x,y) wether lesser or higher 
          //when the properties gets updated since wr using the same socket of the player he can retrieve the new x,y of paddles
          //then we can clear the whole ground we playing on and design the paddls on it's new x and y 
          //since this update gets called infinitly it will look like it's moving based on your needs 
          if (socket.current != null && gameState.current != null) {
            if (p5.keyIsDown(13) && socket.current.id !== gameState.current.lastscored) {
              socket.current.emit("player_pressed_key", { input: "ENTER" });
            }
            if (p5.keyIsDown(87)) {
              socket.current.emit("player_pressed_key", { input: "UP" });
            }

            if (p5.keyIsDown(83)) {
              socket.current.emit("player_pressed_key", { input: "DOWN" });
            }
          }
        }
        const handlePlayerTwoInput = (p5: p5Types) => {
          if (socket.current != null && gameState.current != null) {
            if (p5.keyIsDown(13) && socket.current.id !== gameState.current.lastscored) {
              socket.current.emit("player_pressed_key", { input: "ENTER" });
            }
            if (p5.keyIsDown(87)) {
              socket.current.emit("player_pressed_key", { input: "UP" });
            }
            if (p5.keyIsDown(83)) {
              socket.current.emit("player_pressed_key", { input: "DOWN" });
            }
          }

        }
        // 
        // ok in here like we know every player got a socket and every socket got an Id for ex adc24a4cad2c4adc mix of numbers and letters 
        // but how can we know which one of them is player1 and which one is player 2
        // in here we use the indexOf method that can help us find the first occurence that is equal to the one we search for
        // you can say we store these sockets id in an array arr = ["Sdcsdcs51s0", "sdc5s5d2cs12"];
        // when we call arr.indexOf("Sdcsdcs51s0") which is the first one it will print out 0 
        //when we receive 1 or 0 or we call their own paddle updating functions
        //console.log("Index is "+(socket.current?.id));
        if (gameState.current.players.indexOf(socket.current?.id) === 0)
          handlePlayerOneInput(p5);
        if (gameState.current.players.indexOf(socket.current.id) === 1)
          handlePlayerTwoInput(p5);
      }

    }
  }
  //};
  return <>

    {
      state === "waiting" ?
        <div >
          <button onClick={() => {
            //alert()

            setState("play");
            setCpt(Cpt + 1);

          }}
          >
            Play a Game
          </button>

          <button onClick={() => {
            //alert() 
            
            setState("spect")

          }}
          >
            Spectate a Game
          </button>
        </div>


        : (state === "spect" ?
          
          <div>
            {/* {Array.from({ length: layhfdk }, (v, i) => i + 1).map(i => (
              <button key={i} onClick={() => buttonPressed(i)}>YAWDI HAAAANAAAAA {i}</button>
            ))} */}
            <Spectator/>
          </div>
          : <div className="flex flex-col items-center justify-center min-h-full md:shrink-0 w-full h-full absolute" style={{ backgroundImage: `url(${BackGround})` }}>
              <Show_users_props/>
              <Sketch setup={setup} draw={draw} />

              

            </div>)        



    }

  </>
  return <Sketch setup={setup} draw={draw} />;
};


export default SketchPong;

