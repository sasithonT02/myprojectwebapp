import React, { useState } from 'react';
import './Add.css';
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useEffect } from 'react';


const Add = ({ url }) => {

  const navigate = useNavigate();
  const { token, Sale } = useContext(StoreContext);
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    menu_name: "",
    description: "",
    menu_date: "",
    price: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("menu_name", data.menu_name);
    formData.append("description", data.description);
    formData.append("menu_date", data.menu_date);
    formData.append("price", Number(data.price));
    formData.append("image", image);
    const response = await axios.post(`${url}/api/menu/add`, formData);
    if (response.data.success) {
      setData({
        menu_name: "",
        description: "",
        menu_date: "",
        price: ""
      });
      setImage(false);
      toast.success(response.data.message);
    }
    else {
      toast.error(response.data.message);
    }

  };

  useEffect(() => {
    if (!Sale && !token) {
      toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
      navigate("/");
    }
  }, []);


  return (
    <div className='add-menu'>
      <h2>เพิ่มเมนูอาหาร</h2>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <label htmlFor="image">
            {image ? (
              <img src={URL.createObjectURL(image)} alt="Preview" />
            ) : (
              <p className="upload-text">คลิกเพื่ออัปโหลดรูปภาพเมนูอาหาร</p>
            )}
          </label>
          <input
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImage(e.target.files[0]);
              }
            }}
            accept='image/*'
            type="file"
            id="image"
            hidden
          />
        </div>
        <div className="add-product-name flex-col">
          <p>ชื่อเมนู</p>
          <input
            onChange={onChangeHandler}
            value={data.menu_name}
            type="text"
            name="menu_name"
            placeholder='กรุณาป้อนชื่อเมนูอาหาร'
            required />
        </div>
        <div className="add-producct-description flex-col">
          <p>รายละเอียดของเมนู</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
            placeholder='เพิ่มรายละเอียดเกี่ยวกับเมนูอาหาร'
          >
          </textarea>
        </div>
        <div className="add-date">
          <p>วันที่จำหน่าย</p>
          <input
            onChange={onChangeHandler}
            value={data.menu_date}
            type="date"
            name='menu_date'
          />
        </div>
        <div className="add-price flex-col">
          <p>ราคา</p>
          <input
            onChange={onChangeHandler}
            value={data.price}
            type="number"
            name='price'
            placeholder='กรุณาป้อนราคาเมนูอาหาร'
            required />
        </div>
        <button type='submit' className='add-btn'>บันทึก</button>
      </form>
    </div>
  );
};

export default Add;