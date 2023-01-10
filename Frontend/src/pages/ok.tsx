import axios from "axios";
import React, { useEffect, useState } from "react";
import avatar1 from "../../Assets/Ellipse 213.png";
import fireIcon from "../../Assets/fire.png";

const ProfileUp = () => {
  const Getachiev = () => 
  {
    axios.get('http://localhost:5000/user/achievements', {withCredentials: true})
    .then(res => {
      console.log(res.data)
    }).catch(err=> {
      console.log(err)
    })

    return ( <div>g</div> 

    )
  }
  

  return ( <div> 
   test === <Getachiev/>
    </div>
  );
};

export default ProfileUp;