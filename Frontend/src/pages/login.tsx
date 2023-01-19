// import React from "react";

// const Login = () => {

//     return(
//         <>
//             <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3456f615f72b01d8343af7dca0e97ee93a39ddcccbbf754dd828749d46bff59e&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fauth%2Flogin&response_type=code"> Login </a>
//         </>
//     )
// }

// export default Login





import Logo42 from "./42.png"

export default function LandingPage() {

  return (
      <div className="grid grid-cols-5 divide-x-2 min-h-screen bg-[#262626] text-white justify-center items-center align-center">
        <div className="grid   items-center justify-center col-span-5 ">
          <section className="flex flex-col h-82 px-14 py-32 gap-y-8 shadow-lg bg-black max-w-md  rounded-xl">
            <header className="flex items-center flex-col gap-y-2">
              <h1 className="text-3xl font-bold">Sign in to Pong</h1>
              <p className="text-gray-100">
                Login to play Pong with your friends
              </p>
            </header>
            <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3456f615f72b01d8343af7dca0e97ee93a39ddcccbbf754dd828749d46bff59e&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fauth%2Flogin&response_type=code">
            <button
              onClick={(e) => {
                e.preventDefault();
              }}
              type="button"
              className="flex items-center justify-center gap-x-4 px-10 py-4 rounded-xl bg-[#26A68E]
              hover:scale-105 hover:bg-[#005f31] transition duration-300 ease-in-out w-full"
            >
              <img
                src={Logo42}
                width={42}
                height={42}
                alt="42 logo"
              />
              <p className="pb-0.5 font-semibold text-black text-lg">
                Sign in with 42
              </p>
            </button>
            </a>
          </section>
        </div>
        {/* <figure className="sm:col-span-3 hidden xl:block">
          <img
            src={"https://images.unsplash.com/photo-1586846535322-236ae1c9a134?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80%22%7D"}
            alt="Pong image"
            className="object-cover w-full h-full max-h-screen -hue-rotate-60
            "
          />
        </figure> */}
      </div>
  );
}
