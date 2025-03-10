import React, { useContext, useEffect, useState } from 'react';
import './List.css';
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const List = ({ url }) => {

  const { token, Sale } = useContext(StoreContext);
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/menu/listseller`)
    console.log(response.data);
    if (response.data.success) {
      setList(response.data.data);
    }
    else {
      toast.error("Error");
    }
  }

  // ลบเมนู
  const removeMenu = async (menuId) => {
    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?");
    if (!confirmDelete) return;

    const response = await axios.post(`${url}/api/menu/remove`, { menu_id: menuId });
    await fetchList();

    if (response.data.success) {
      toast.success(response.data.message);
    } else {
      toast.error("Error");
    }
  };

  // แก้ไขเมนู
  const editMenu = (menu) => {
    // Navigate ไปหน้าฟอร์ม EditMenu พร้อมส่งข้อมูลเมนูที่ต้องการแก้ไข
    navigate("/edit", { state: { menu } });
  }

  useEffect(() => {
    if (!Sale && !token) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      navigate("/");
    }
    fetchList();
  }, [])

  return (
    <div className='list-menu'>
      <h2>รายการเมนูอาหารทั้งหมด</h2>
      <div className="list-table">
        <div className="list-table-format title">
          <b>รูปภาพ</b>
          <b>ชื่อเมนู</b>
          <b>วันที่</b>
          <b>ราคา</b>
          <b>แก้ไข</b>
          <b>ลบ</b>
        </div>
        {list.map((menu, index) => {
          return (
            <div key={index} className="list-table-format">
              <img src={`${url}/images/` + menu.image} alt="" />
              <p>{menu.menu_name}</p>
              <p>{menu.menu_date}</p>
              <p>{menu.price}</p>
              <button
                onClick={() => editMenu(menu)}
                className="edit-button">แก้ไข
              </button>
              <button
                onClick={() => removeMenu(menu.menu_id)}
                className="delete-button">ลบ
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default List;