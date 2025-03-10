import React from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-options">
                <NavLink to='./dashboard' className="sidebar-option">
                    <img src={assets.dashboard_icon} alt="" />
                    <p>Dashboard</p>
                </NavLink>
                <NavLink to='./orders' className="sidebar-option">
                    <img src={assets.order_icon} alt="" />
                    <p>รายการการสั่งซื้ออาหาร</p>
                </NavLink>
                <NavLink to='./add' className="sidebar-option">
                    <img src={assets.add_icon} alt="" />
                    <p>เพิ่มเมนูอาหาร</p>
                </NavLink>
                <NavLink to='./list' className="sidebar-option">
                    <img src={assets.list_icon} alt="" />
                    <p>รายการเมนูอาหาร</p>
                </NavLink>
                <NavLink to='./addingredient' className="sidebar-option">
                    <img src={assets.add_icon} alt="" />
                    <p>เพิ่มวัตถุดิบ</p>
                </NavLink>
                <NavLink to='./listingredients' className="sidebar-option">
                    <img src={assets.list_icon} alt="" />
                    <p>รายการวัตถุดิบ</p>
                </NavLink>
                <NavLink to='./menuIngred' className="sidebar-option">
                    <img src={assets.use_icon} alt="" />
                    <p>รายการใช้งานวัตถุดิบ</p>
                </NavLink>
                <NavLink to='./useingredients' className="sidebar-option">
                    <img src={assets.calculate_icon} alt="" />
                    <p>คำนวณวัตถุดิบ</p>
                </NavLink>
                <NavLink to='./setOrders' className="sidebar-option">
                    <img src={assets.clock_icon} alt="" />
                    <p>เวลาเปิด-ปิดรับคำสั่งซื้อ</p>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;