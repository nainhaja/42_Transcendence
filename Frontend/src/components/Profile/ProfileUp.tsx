import { render } from "@testing-library/react";
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Swal from "sweetalert2";
import { StringLiteral } from "typescript";
import avatar1 from "../../Assets/Ellipse 213.png";
import fireIcon from "../../Assets/fire.png";
import { Usercontext } from "../../context/Usercontext"
//import IoMdPersonAdd from 
import { IoMdPersonAdd } from 'react-icons/io'
import { ImBlocked } from 'react-icons/im'
import { CgUnblock } from 'react-icons/cg'
import { game_socket_context, main_socket_context } from "../../sockets";

interface user_info_whistory {

  user1_name: string;
  user2_name: string;

  user1_score: number;
  user2_score: number;

  user1_avatar: string;
  user2_avatar: string;
  //achievements: Achievement[]
}

const ProfileUp = () => {
  
  const [me, itsme] = useState(true);
  const main_socket = useContext(main_socket_context);
  const navigate = useNavigate();
  const [Username, setUsername] = useState("");
  const [fullname, getFullname] = useState("");
  const [isLogged, setisLogged] = useState("");

  const game_socket = useContext(game_socket_context);
  const [len, setLen] = useState(0);
  
  const [mee, itsmee] = useState("");
  const [check, Setcheck] = useState("");
  let shkon = window.location.pathname.split("/", 3)[2];
  let url: string;

  const location = useLocation();

  function ButtonisPressed()
  {
    main_socket.emit("invite_game", {player1: User})
    game_socket.emit("invite_queue", { mode: 4, state: 1, player: User.id});
    navigate("/game/4");
  }

  if (shkon) {
    url = "http://localhost:5000/user/user/" + shkon;
  }
  else {
    url = "http://localhost:5000/user/user"
  }
  useEffect(() => {
    let response = axios.get('http://localhost:5000/user/status_friend/' + shkon, { withCredentials: true })
      .then((res) => {
        Setcheck(res.data.status);
      })
  }, [location])

  const handle_add = () => {
    let res = axios.post('http://localhost:5000/user/add_friend/' + shkon, { shkon }, { withCredentials: true }).then((res) => {
      navigate("/profile/" + shkon);
    }).catch((err) => {
      window.alert(err);
    })
  }
  const handle_remove = () => {
    let res = axios.post('http://localhost:5000/user/remove_friend/' + shkon, { shkon }, { withCredentials: true }).then((res) => {
      navigate("/profile/" + shkon);
    }).catch((err) => {
      window.alert(err);
    })
  }
  const handle_block = () => {
    let res = axios.post('http://localhost:5000/user/block_friend/' + shkon, { shkon }, { withCredentials: true }).then((res) => {
      navigate("/profile/" + shkon);
    }).catch((err) => {
      window.alert(err);
    })
  }
  const handle_unblock = () => {
    let res = axios.post('http://localhost:5000/user/unblock_friend/' + shkon, { shkon }, { withCredentials: true }).then((res) => {

      navigate("/profile/" + shkon);
    }).catch((err) => {
      window.alert("You cant Unblock Someone Who Blocked You ");
    })
  }

  //window.alert("WASH ANAaa " + me);

  // if (shkon)//ayarjhou
  // {
  //   console.log(`${shkon} || ${response.data.username}`)
  //   if (shkon == response.data.username) {
  //     itsme(false)
  //     window.alert("HAHWA;;hD DdKHDFLP L;FALSE ");

  //   }
  //   else
  //     itsme(true);
  // }
  // else
  //   itsme(false)

  const fetchMe = () => {
    axios.get("http://localhost:5000/user/user", { withCredentials: true }).then((res) => {
      if (shkon)//ayarjhou
      {
        //console.log(`${shkon} || ${res.data.username}`)
        if (shkon == res.data.username) {
          itsme(false)
          // window.alert("HAHWA;;hD DdKHDFLP L;FALSE "); 
        }
        else
          itsme(true);
      }
      else
        itsme(false)
    }).catch((err) => {
      console.log(err)
    })
  }
  let new_arr : Array<user_info_whistory> = new Array<user_info_whistory>();
  const [User, SetUser] = useState<any>({});
  const [historyox, sethistoryox] = useState<Array<user_info_whistory>>([]);

  const history_arr = useRef(null as null |  Array<user_info_whistory>);

  const [history, SetHistory] = useState(Array<any>);
  useEffect(() => {
    axios.get(url, { withCredentials: true })
      .then((response) => {
        itsmee(response.data.username);
        //const meFactor = response.data.username === shkon ? false : true;
        //itsme(meFactor);
        SetUser(response.data);
        setUsername(response.data.username);
        getFullname(response.data.full_name);
        setisLogged(response.data.status);

      }).catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Friend not found',
          footer: '<Link to={"/"} Why do I have this issue? Probably because Baghi t7esselna</Link>'
        })
        navigate("/errornotfound");
      });
    fetchMe();


  }, [location])

  useEffect(() => {
    axios.get(url, {withCredentials: true})
    .then((response) =>{
        console.log("nigga" + response.status)
        SetUser(response.data);
      }).catch(error => 
        {  
          console.log("nigga" + error.response.status)
          navigate("/errornotfound");
        });
  },[])

  useEffect(() => {

    main_socket.emit("get_match_history", {username: shkon})

    main_socket.on("match_history", (data: Array<user_info_whistory>) => {
     //
    
      history_arr.current = data;
      // for(let i=0; i < data.length; i++)
      // { 
      //   //SetHistory(data[i]);
      //   new_arr.push(data[i]);
      //   //console.log("hana brb ila hna " + data[i].user1_name+" l3ebt maa "+data[i].user1_avatar);
      //  // console.log("Score dial nizar hwa " + data[i].user1_score+" score dial raki hwa "+data[i].user2_score);

      // }
      sethistoryox(data);
      setLen(+data.length);
      // for(let i=0; i < data.length; i++)
      // { 
      //   //SetHistory(data[i]);
      //   console.log("hana brb ila hna " + (historyox[i])?.user1_name+" l3ebt maa "+(historyox[i])?.user1_name);
      //   console.log("Score dial nizar hwa " + (historyox[i])?.user1_score+" score dial raki hwa "+(historyox[i])?.user2_score);

      // }
      
  })
  },[])

  return (
    <div className="flex items-center justify-center gap-[120px]">
      {/* {{itsme} && } */}
      <div>
        {me && check == "not_friend" && (
          <div>
            <div>
              <button className='addbutton'>
                <div className="text-[#00FF00] font-[500] tracking-wider text-[#F2F2F2]" onClick={handle_add}>ADD</div>
                <IoMdPersonAdd />
              </button>
            </div>
            <div>
              <button className='addbutton'>
                <div className="text-[#00FF00] font-[500] tracking-wider " onClick={handle_block} >Block</div>
                <ImBlocked />
              </button>
            </div>
          </div>
        )
        }
        {me && check == "friend" && (
          <div>
            <div>
              <button className='addbutton'>
                <div className="text-[#FF0000] font-[1000] tracking-wider " onClick={handle_block}>Block</div>
                <ImBlocked />
              </button>
            </div>
            <div>
              <button className='addbutton'>
                <div className="text-[#FF0000] font-[500] tracking-wider" onClick={handle_remove}>Remove Friend</div>
                <ImBlocked />
              </button>
            </div>
            <div>
              <>
              { isLogged == "ON" ?
                <button onClick={ButtonisPressed} type="button" className="transition duration-300 ease-in-out align-center w-full justify-center items-center"> 
                    Invite To A Game
                </button> : <></>
              }
              </>
            </div>
          </div>
        )

        }
        {me && check == "blocked" && (
          <button className='addbutton'>
            <div className="text-[#0000FF] font-[500] tracking-wider " onClick={handle_unblock} >Unblock</div>
            <CgUnblock />
          </button>)
        }
        <div className="flex items-center gap-[40px]">
          <div>
            <img
              className="w-[140px] h-[140px] object-contain"
              src={User.avatar}
              alt="avatar"
            />
          </div>
          <br />


          <div>
            <h1 className="text-[24px] font-[500] tracking-wider text-[#F2F2F2]">
              {fullname}
            </h1>
            <h6 className="text-[#828282] text-[20px] tracking-wider">{Username}</h6>
          </div>
        </div>
        <div className="h-fit px-[27px] py-[21px] flex items-center gap-[40px] bg-[#262626] rounded-[20px]">
          <h1 className="text-[24px] text-white">
            Current <span className="text-[#ECCC6B]">Score</span> :
          </h1>
          <div className="flex items-center gap-[1rem]">
            <img src='../../Assets/fire.png' alt="fire" />
            <h1 className="text-[22px] text-white">
              5734 <span className="text-[#ECCC6B]">PTS</span>
            </h1>
          </div>
        </div>
      </div>

      <div
        className=" h-3/12 px-[1.5rem] scrollbar-hide overflow-hidden overflow-y-scroll py-[1rem] rounded-[20px] flex flex-col  bg-[#262626] text-white text-[24px] mb-[12px] font-[600]"> 
        {Array.from({ length: len}, (v, i) => i + 1).map(i => (
          <>
            <div className=" bg-[#1F9889] flex flex-row  rounded-full  text-base my-5 items-center hover:bg-[#C66AE1] text-center">
            
                <div className="h-5/6 w-6/12 flex  flex-row text-white text-base text-center">
                    <img className="rounded-full w-4/12" src={(historyox[i - 1])?.user1_avatar}></img>
                    <div className="">{(historyox[i - 1])?.user1_name}</div>    
                </div>

                <div className="h-3/6 w-1/12  flex flex-center text-base justify-center items-center text-white bg-black my-3 rounded-xl"> {(historyox[i - 1])?.user1_score} - {(historyox[i - 1])?.user2_score}</div>
                
                <div className="h-5/6 w-6/12 flex justify-end flex-row text-white text-base text-center">
                        <div className="">{(historyox[i - 1])?.user2_name}</div>
                        <img className="rounded-full w-4/12" src={(historyox[i - 1])?.user2_avatar}></img>
                </div>
            </div>

            </>
        ))
        }
    </div>


    </div>
  );
};

export default ProfileUp;
