import axios from "axios";
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import imaage from "./42.png"
import "./login.css"

const Login = () => {
    const [logged, setLogged] = useState(false);
	const navigate = useNavigate();
 
    const handlelogin = () =>{
        window.location.replace("http://localhost:5000/auth/login");
        setLogged(true);
        if(logged)
            console.log("ALEADY LOGGED IN ");
        else
            console.log("FIRST TIME HUH");
	}
    return(
        <div className="Login" >
        <h1 className="LoginHeading">BGHITI T9SSR SIR LUM6P</h1>
        <div className='Buttonin'>
               <img className='imgs'  src={imaage} alt="pof" width={"19vw"} height={"19vh"}/>
            <button onClick={handlelogin} className='input_submit' type='submit' >Continue with Intra </button>
        </div>
    </div>
    )
}

export default Login