import React, { useContext, useEffect } from "react";
import "./Login.css";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Login = ({ url }) => {

  const navigate = useNavigate();
  const { Sale, setSale, token, setToken } = useContext(StoreContext);
  const [data, setData] = useState({
    username: "",
    password: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    const response = await axios.post(url + "/api/user/login", data);
    if (response.data.success) {
      if (response.data.role === "Sale") {
        setToken(response.data.token);
        setSale(true);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("Sale", true);
        toast.success("เข้าสู่ระบบสำเร็จ");
        navigate("/dashboard");
      } else {
        toast.error("คุณไม่มีสิทธิ์เข้าใช้งาน");
      }
    } else {
      toast.error(response.data.message);
    }
  };

  useEffect(() => {
    if (Sale && token) {
      navigate("/dashboard");
    }
  }, [Sale, token])

  return (
    <div className="sale-login-popup">
      <form onSubmit={onLogin} className="sale-login-popup-container">
        <div className="sale-login-popup-title">
          <h2>เข้าสู่ระบบ</h2>
        </div>
        <div className="sale-login-popup-inputs">
          <p>ชื่อบัญชีผู้ใช้:</p>
          <input
            name="username"
            onChange={onChangeHandler}
            value={data.username}
            type="text"
            placeholder="ป้อนชื่อบัญชีผู้ใช้"
            required
          />
          <p>รหัสผ่าน:</p>
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="ป้อนรหัสผ่าน"
            required
          />
        </div>
        <button className="sale-login-button" type="submit">เข้าสู่ระบบ</button>
      </form>
    </div>
  );
};

export default Login;
