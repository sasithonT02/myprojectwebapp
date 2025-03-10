import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";


const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    toast.success("ออกจากระบบแล้ว")
    navigate("/");
  };

  return (
    <div className='navbar'>
      <Link to='/'><img src={assets.logo} alt="" className="logo" /></Link>
      <ul className="navbar-menu">
        <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>หน้าหลัก</Link>
        <a href='#food-display' onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>เมนู</a>
        <a href='#footer' onClick={() => setMenu("contact")} className={menu === "contact" ? "active" : ""}>ติดต่อ</a>
      </ul>
      <div className="navbar-right">
        <div className="navbar-search-icon">
          <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
        {!token ? <button onClick={() => setShowLogin(true)}>ลงชื่อเข้าใช้</button>
          : <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="" />
            <ul className='nav-profile-dropdown'>
              <Link to='/editprofile'><li><img src={assets.user_icon} alt="" /><p>โปรไฟล์</p></li></Link>
              <hr />
              <li onClick={() => navigate("/myorders")}><img src={assets.bag_icon} alt="" /><p>คำสั่งซื้อ</p></li>
              <hr />
              <li onClick={logout}><img src={assets.logout_icon} alt="" />ออกจากระบบ</li>
            </ul>
          </div>
        }
      </div>
    </div>
  );
};

export default Navbar;