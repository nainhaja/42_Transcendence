import avatar1 from "../Assets/Ellipse 213.png";
import DisplayName from "../components/Settings/DisplayName";
import TwoFactor from "../components/Settings/TwoFactor";
import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import Modal from "react-modal";
import Checkbox from "./Checkbox";
import { Usercontext } from "../context/Usercontext";
import Swal from 'sweetalert2'
import { Navigate, useNavigate } from "react-router-dom";


type DataType = {
  isTwoFactor: false;
};

const Settings = ({ state }: { state: boolean }) => {
  const [isChecked, setIsChecked] = useState<boolean>(state);
  const [twoFactorModal, setModal] = useState<boolean>(false);
  const [User, GetUser] = useState("")
  const [avatar, NewAvatar] = useState('');
  const [Username, setUsername] = useState("");
  const [updated, setUpdated] = useState(true);

  const handleModal = async () => {
    console.log("sanfrasisco : " + isChecked);
    if (!isChecked) {
      console.log("wash true or fals : " + twoFactorModal);
      setModal(true);
      setUpdated(!updated);
      return;
    }
  }
  const navigate = useNavigate();
  // useEffect(() => {

  // }, [updated])

  const handleDisable = async (e: any) => {
    e.preventDefault();
    console.log("fass fass " + isChecked);
    const url1 = "http://localhost:5000/auth/login/2fa/disable";
    let response = await axios.post(url1, isChecked,
      {
        withCredentials: true,
      }).then((res) => {
      
        window.location.reload();
      }).catch(err => {
        // Swal.fire({
        //   icon: 'error',
        //   title: 'Oops...',
        //   text: '2FA Already Disabled',
        //   footer: '<Link to={"/"} Why do I have this issue? Probably because Baghi t7esselna</Link>'
        // })
        window.alert("2FA ALRREADY DISABLED");
        window.location.reload();
      });
    // if (!isChecked)
    // {
    //   console.log("clicked here");
    //   await axios.post('http://localhost:5000/auth/login/2fa/disable',{withCredentials: true})
    //  .then(res => {
    //   window.alert("haheho");
    //   setIsChecked(false);
    //  }).catch(err=> {
    //    window.alert("azbii already disabled ");
    //    console.log("error : " +err);
    //  })
    // }
    // else
    //   window.alert("already disable hehe");

  }
  axios.get('http://localhost:5000/user/user', { withCredentials: true })
    .then(res => {
      GetUser(res.data.full_name);
      NewAvatar(res.data.avatar);
      setUsername(res.data.username);
    }).catch(err => {
      console.log(err)
    })

  return (
    <div className="w-[1021px] min-h-screen">
      <h1 className="text-[77px] text-[#F2F2F2] text-center font-[700] tracking-wider">
        Settings
      </h1>
      <div className="mt-[46px]">
        {/* -------- profile info --------- */}
        <div>
          {/* ------ left side ----- */}
          <div className="flex items-center gap-[40px]">
            <div>
              <img
                className="w-[140px] h-[140px] object-contain"
                src={avatar}
                alt="avatar"
              />
            </div>
            <div>
              <h1 className="text-[24px] font-[500] tracking-wider text-[#F2F2F2]">
                {User}
              </h1>
              <h6 className="text-[#828282] text-[20px] tracking-wider">
                {Username}
              </h6>
            </div>
          </div>
        </div>
        {/* ------ top part ------- */}
        <div className="mt-[108px]">
          <DisplayName setUser={GetUser} setAvatar={NewAvatar} />
        </div>
        {/* ------ bottom part ------ */}
        <div className="mt-[144px] flex items-center gap-[44px]">
          <div>
            <Checkbox onClick={handleModal} name="isTwoFactor" id="two-factor" checked={isChecked}>
              Two Factor Authentication
            </Checkbox>
            <TwoFactor
              isOpen={twoFactorModal}
              setIsOpen={setModal}
              contentLabel="SCAN QR CODE"
              setTwoFactor={setIsChecked}
            />
            <br />
          </div>
          <div>
            <button onClick={handleDisable} name="disable">
              Disable Two-Fa-Authentificatios.<br /> "Only Click Here if You Are Already Enabled this Feature"
            </button>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Settings;
