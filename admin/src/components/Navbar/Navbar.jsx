import React, { useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Navbar = () => {

  const navigate = useNavigate();
  const { token, Sale, setSale, setToken } = useContext(StoreContext);
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("Sale");
    setToken("");
    setSale(false);
    toast.success("ออกจากระบบแล้ว")
    navigate("/");
  }

  return (
    <div className="navbar">
      <img className="logo" src={assets.logo} alt="" />
      {token && Sale ? (
        <button className="sale-logout-button">
          <p className="login-conditon" onClick={logout}>ออกจากระบบ</p>
        </button> // เงื่อนไข if แบบย่อ {token && Sale ? (...) : (...)}
      ) : (
        <p className="login-conditon" onClick={() => navigate("/")}>เข้าสู่ระบบ</p>
      )}
    </div>
  );
};

export default Navbar;
