import React from "react";
import { Link } from 'react-router-dom';

const Watching = () => {

    return(
        <>
         <div className="h-screen w-screen flex justify-center items-center flex-col">
           <div className="bg-gray-500  flex flex-col h-10 w-1/6 rounded-lg items-center justify-center text-white ">Watch Now</div>
           <div className="bg-black flex flex-col h-3/6 w-2/6 rounded-lg overflow-scroll ">

               <div className=" bg-gray-700 h-1/6 flex flex-row hover:bg-slate-400 my-3 ">

                   <div className="h-5/6 w-6/12 flex flex-row text-white text-base text-center">
                       <img className="rounded-full" src="https://cdn.intra.42.fr/users/123df55698ccec53309eb17309bc5ba1/ael-bagh.jpg"></img>
                       <div className="">Ael-Bagh</div>    
                   </div>

                   <div className="h-3/6 w-1/12 flex flex-row text-base justify-center items-center text-white bg-black my-3 rounded-xl"> 2-1</div>
                   
                   <div className="h-5/6 w-6/12 flex flex-row justify-end text-white text-center text-base">
                         <div className="">Ael-Bagh</div>
                        <img className="rounded-full" src="https://cdn.intra.42.fr/users/123df55698ccec53309eb17309bc5ba1/ael-bagh.jpg"></img>
                   </div>
                
                
                </div>  
           </div>
           
        </div>
        </>
    )
}

export default Watching