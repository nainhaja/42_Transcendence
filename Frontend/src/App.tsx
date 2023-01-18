import React from 'react';
import { FunctionComponent, useEffect, useState , useRef} from "react";
import Sketch  from "react-p5";
import p5Types from "p5";
import { io, Socket } from "socket.io-client";
import {GameState} from "./components/Ball"
import p5 from 'p5';
import {Paddle, Lobby, MessageInput} from "./components/Lobby"
import logo from './logo.svg';
import  SketchPong  from './components/My_sketch';
import  Spectator  from './components/spectator_mod';
import  Homee  from './pages/home';

import  Login  from './pages/login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Watching from './pages/watch';
import Spect from './components/spectator';
import Chat from './components/Chat';
import ProfileUp from './pages/ok';
import Main_chat from './components/main_chat';
import { ChatContext } from './Contexts/ChatContext';
import Nono from './components/message';
import { Dashboard, Home } from './components/souhail';
import  History  from './components/history';
import { BiHeart } from 'react-icons/bi'





function App() {
  return (
  <BrowserRouter>
      <Routes>
        <Route path='/' element={<Dashboard/>} >
        <Route index element= { <Home/> } />
        </Route>
        
        <Route path='/game/*' element={<SketchPong/>} />
        <Route path='/watch/*' element={<Spectator/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/play' element={<Homee/>} />
        <Route path='/history' element={<History/>} />
       
        <Route path='/watching' element={<Watching/>} />
        <Route path='/spect' element={<Spect/>} />
        <Route path='/chat' element={<Chat/>} />
        <Route path='/profile' element={<ProfileUp/>} />
        <Route path='/main_chat' element={<Main_chat/>} />
        <Route path='/nono' element={<Nono/>} />
        
      </Routes>
  
  </BrowserRouter>)

}
  
 export default App

