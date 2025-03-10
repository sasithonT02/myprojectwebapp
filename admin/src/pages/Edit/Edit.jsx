import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Edit.css';
import { toast } from "react-toastify";
import { StoreContext } from '../../context/StoreContext';

const Edit = ({ url }) => {

  const { token, Sale } = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { menu } = location.state; // รับข้อมูลเมนูที่ส่งมาจากหน้า List

  const [data, setData] = useState({
    menu_name: menu.menu_name,
    description: menu.description,
    menu_date: menu.menu_date,
    price: menu.price
  });
  const [image, setImage] = useState(null);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("menu_id", menu.menu_id);
    formData.append("menu_name", data.menu_name);
    formData.append("description", data.description);
    formData.append("menu_date", data.menu_date);
    formData.append("price", Number(data.price));
    if (image) formData.append("image", image);

    const response = await axios.post(`${url}/api/menu/edit`, formData);
    if (response.data.success) {
      toast.success(response.data.message);
      navigate("/list"); // กลับไปหน้ารายการ
    } else {
      toast.error(response.data.message);
    }
  };

  useEffect(() => {
    if (!Sale && !token) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      navigate("/");
    }
  },[])

  return (
    <div className='edit-menu'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="edit-img-upload flex-col">
          <p>แก้ไขเมนูอาหาร</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : `${url}/images/${menu.image}`} alt="" />
          </label>
          <input
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImage(e.target.files[0]);
              }
            }}
            type="file"
            id="image"
            hidden
          />
        </div>
        <div className="edit-product-name flex-col">
          <p>ชื่อเมนู</p>
          <input
            onChange={onChangeHandler}
            value={data.menu_name}
            type="text"
            name="menu_name"
            required
          />
        </div>
        <div className="edit-product-description flex-col">
          <p>รายละเอียดของเมนู</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
          ></textarea>
        </div>
        <div className="edit-date">
          <p>วันที่จำหน่าย</p>
          <input
            onChange={onChangeHandler}
            value={data.menu_date}
            type="date"
            name="menu_date"
          />
        </div>
        <div className="edit-price flex-col">
          <p>ราคา</p>
          <input
            onChange={onChangeHandler}
            value={data.price}
            type="number"
            name="price"
            required
          />
        </div>
        <button type="submit" className='edit-btn'>บันทึก</button>
      </form>
    </div>
  );
};

export default Edit;
