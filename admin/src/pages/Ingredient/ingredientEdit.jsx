import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ingredientEdit.css';
import { toast } from "react-toastify";
import { StoreContext } from '../../context/StoreContext';

const IngredientEdit = ({ url }) => {

  const { token, Sale } = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { ingredient } = location.state; // รับข้อมูลวัตถุดิบที่ส่งมาจากหน้า List

  const [dataedit, setDataedit] = useState({
    ingredients_name: ingredient.ingredients_name,
    ingredients_unit: ingredient.ingredients_unit,
    price: ingredient.price,
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setDataedit((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.put(`${url}/api/ingredient/editIngred`, {
        ingredients_id: ingredient.ingredients_id, // ✅ ส่งเป็น JSON
        ingredients_name: dataedit.ingredients_name,
        ingredients_unit: dataedit.ingredients_unit,
        price: Number(dataedit.price),
      }, {
        headers: { "Content-Type": "application/json" } // ✅ แจ้งว่าเป็น JSON
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/listingredients");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
      console.error(error);
    }
  };

  useEffect(() => {
    if (!Sale && !token) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      navigate("/");
    }
  }, [])


  return (
    <div className='editIngred'>
      <form className='editIngreds flex-col' onSubmit={onSubmitHandler}>
        <h2>แก้ไขวัตถุดิบ</h2>
        <div className="edit-Ingred-name flex-col-Ingred">
          <p>ชื่อวัตถุดิบ</p>
          <input
            onChange={onChangeHandler}
            value={dataedit.ingredients_name}
            type="text"
            name="ingredients_name"
            required
          />
        </div>
        <div className="edit-product-unit flex-col-Ingred">
          <p>หน่วยของวัตถุดิบ</p>
          <input
            onChange={onChangeHandler}
            value={dataedit.ingredients_unit}
            type="text"
            name="ingredients_unit"
            required
          />
        </div>
        <div className="editIngred-price flex-col-Ingred">
          <p>ราคา</p>
          <input
            onChange={onChangeHandler}
            value={dataedit.price}
            type="number"
            name="price"
            required
          />
        </div>
        <button type="submit" className='editIngred-btnIngred'>บันทึก</button>
      </form>
    </div>
  );
};

export default IngredientEdit; // Changed the export to match the component name
