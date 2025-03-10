import React, { useContext, useEffect, useState } from 'react';
import './ingredientAdd.css';
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const IngredientAdd = ({ url }) => {

  const navigate = useNavigate();
  const { token, Sale } = useContext(StoreContext);
  const [data, setData] = useState({
    ingredients_name: "",
    ingredients_unit: "",
    price: "",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(data => ({
      ...data,
      [name]: name === "price" ? Number(value) : value
    }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${url}/api/ingredient/addIngred`, data);
      if (response.data.success) {
        setData({ ingredients_name: "", ingredients_unit: "", price: "" });
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล");
      console.error("Error submitting ingredient:", error);
    }
  };

  useEffect(() => {
    if (!Sale && !token) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      navigate("/");
    }
  }, [])

  return (
    <div className='addIngred'>
      <div className='addingredients'>
        <h2>เพิ่มวัตถุดิบ</h2>
      </div>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-ingred-name flex-col">
          <p>ชื่อวัตถุดิบ</p>
          <input
            onChange={onChangeHandler}
            value={data.ingredients_name}
            type="text"
            name="ingredients_name"
            placeholder='กรุณาป้อนชื่อวัตถุดิบ'
            required
          />
        </div>
        <div className="add-ingredient-unit flex-col">
          <p>ชื่อหน่วยของวัตถุดิบ</p>
          <input
            onChange={onChangeHandler}
            value={data.ingredients_unit}
            type="text"
            name="ingredients_unit"
            placeholder='กรุณาป้อนหน่วยของวัตถุดิบ'
            required
          />
        </div>
        <div className="add-ingred-price flex-col">
          <p>ราคาต่อหน่วย</p>
          <input
            onChange={onChangeHandler}
            value={data.price}
            type="number"
            name="price"
            placeholder='กรุณาป้อนราคา'
            required
          />
        </div>
        <button type='submit' className='add-ingred-btn'>บันทึก</button>
      </form>
    </div>
  );
};

export default IngredientAdd;
