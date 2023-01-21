import axios from "axios";
import React  from "react";

interface User_prop
{
    id: string
    full_name: string
    username: string
    avatar: string
    avatar_key: string | null
    is_two_fa_enable: boolean
    two_fa_code: string | null
    email: string
    status: string
    win: number
    lose: number
    score: number
    win_streak: number
    achievements: string
  }

const getUserData =  async()=>{
    let ret  : any = {};

     await axios.get("http://10.12.2.1:5000/user/user", 
      {withCredentials: true} 
      ).then((res)=>{
        ret =  res.data;
      }).catch((err)=>{
    })
    return ret;
}

//export const UserContext = getUserData();
export const main_user_context = React.createContext<Promise<User_prop | "{}">>(getUserData());