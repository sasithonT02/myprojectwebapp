import React, { useContext, useEffect, useState } from 'react'
import './ingredientList.css'
import axios from "axios"
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const IngredientList = ({ url }) => {

  const { token, Sale } = useContext(StoreContext);
  const [listIngred, setListIngred] = useState([]);
  const navigate = useNavigate();

  const fetchListIngred = async () => {
    try {
      const response = await axios.get(`${url}/api/ingredient/listIngred`);
      if (response.data.success) {
        setListIngred(response.data.data);
      } else {
        toast.error("Error fetching ingredients");
      }
    } catch (error) {
      console.error("Error fetching ingredient list:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุดิบ");
    }
  };

  const removeIngredient = async (ingredientId) => {
    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบวัตถุดิบนี้?");
    if (!confirmDelete) return;

    try {
      const response = await axios.post(`${url}/api/ingredient/removeIngred`, { ingredients_id: ingredientId });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchListIngred(); // รีเฟรชรายการหลังจากลบ
      } else {
        toast.error("Error removing ingredient");
      }
    } catch (error) {
      console.error("Error removing ingredient:", error);
      toast.error("เกิดข้อผิดพลาดในการลบวัตถุดิบ");
    }
  };


  const editIngredient = (ingredient) => {
    // Navigate to the EditIngredient form, passing the ingredient data
    navigate("/ingredientEdit", { state: { ingredient } });
  };

  useEffect(() => {
    if (!Sale && !token) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      navigate("/");
    }
    fetchListIngred();
  }, []);

  return (
    <div className='listIngred add flex-col'>
      <h2>รายการวัตถุดิบทั้งหมด</h2>
      <div className="listIngred-tableIngred">
        <div className="listIngred-tableIngred-format title">
          <b>ชื่อวัตถุดิบ</b>
          <b>หน่วย</b>
          <b>ราคา</b>
          <b>แก้ไข</b>
          <b>ลบ</b>
        </div>
        {listIngred.map((ingredient, index) => {
          return (
            <div key={index} className="list-tableIngred-format">
              <p>{ingredient.ingredients_name}</p>
              <p>{ingredient.ingredients_unit}</p>
              <p>{ingredient.price}</p>
              <button
                onClick={() => editIngredient(ingredient)}
                className="editIngred-buttonIngred">แก้ไข
              </button>
              <button
                onClick={() => removeIngredient(ingredient.ingredients_id)}
                className="deleteIngred-buttonIngred">ลบ
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IngredientList;
