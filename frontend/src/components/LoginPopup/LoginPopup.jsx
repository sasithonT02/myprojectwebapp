import React, { useContext, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';


const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setCustomer } = useContext(StoreContext)
  const [currState, setCurrState] = useState("เข้าสู่ระบบ")
  const [data, setData] = useState({
    username: "",
    password: "",
    cust_name: "",
    address: "",
    phone_number: "",

  });
  const navigate = useNavigate();
  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }
  const onLogin = async (event) => {
    event.preventDefault()
    let newUrl = url;
    if (currState === "เข้าสู่ระบบ") {
      newUrl += "/api/user/login"
    }
    else {
      newUrl += "/api/user/register"
    }
    const response = await axios.post(newUrl, data);
    if (response.data.success) {
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      if (response.data.role === "Customer") {
        setCustomer(true);
        localStorage.setItem("Customer", true);
        toast.success("เข้าสู่ระบบสำเร็จ");
        setShowLogin(false);
        navigate("/"); // นำทางไปยังหน้าหลัก
      } else {
        toast.error("คุณไม่มีสิทธิ์เข้าใช้งาน");
      }
    } else {
      toast.error(response.data.message);
    }
  };


  return (
    <div className='login-popup-cust'>
      <form onSubmit={onLogin} className="login-popup-container-cust">
        <div className="login-popup-title-cust">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
        </div>
        <div className="login-popup-inputs-cust">
          {currState === "เข้าสู่ระบบ" ? <></> : <>
            <p>ชื่อ:</p>
            <input
              name='cust_name'
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              autoFocus
              maxLength={20}
              placeholder='กรุณาป้อนชื่อ'
              required
            />
            <p>ที่อยู่:</p>
            <input
              name='address'
              onChange={onChangeHandler}
              value={data.address}
              type="text"
              autoFocus
              maxLength={50}
              placeholder='กรุณาป้อนที่อยู่'
              required
            />
            <p>เบอร์โทรศัพท์:</p>
            <input
              name='phone_number'
              onChange={onChangeHandler}
              value={data.phone_number}
              type="text" maxLength={10}
              placeholder='กรุณาป้อนเบอร์โทรศัพท์แค่ตัวเลขเท่านั้น'
              required
            /></>}
          <p>ชื่อบัญชีผู้ใช้:</p>
          <input
            name='username'
            onChange={onChangeHandler}
            value={data.username}
            type="text"
            maxLength={20}
            placeholder='กรุณาป้อนชื่อบัญชีผู้ใช้'
            required
          />
          <p>รหัสผ่าน:</p>
          <input
            name='password'
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            maxLength={50}
            placeholder='กรุณาป้อนรหัสผ่าน'
            required
          />
        </div>
        <button type='submit'>{currState === "สมัครสมาชิก" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}</button>
        <div className="login-popup-condition-cust">
        </div>
        {currState === "เข้าสู่ระบบ"
          ? <p>ต้องการสร้างบัญชีใหม่ ? <span onClick={() => setCurrState("สมัครสมาชิก")}> กดตรงนี้</span></p>
          : <p>มีบัญชีอยู่แล้ว? <span onClick={() => setCurrState("เข้าสู่ระบบ")}>เข้าสู่ระบบที่นี่</span></p>
        }
      </form>
    </div >
  );
};

export default LoginPopup;