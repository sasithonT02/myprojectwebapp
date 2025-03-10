import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './MenuIngred.css';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const MenuIngred = ({ url }) => {

    const navigate = useNavigate();
    const { token, Sale } = useContext(StoreContext);
    const [menus, setMenus] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [menuId, setMenuId] = useState('');
    const [ingredientsId, setIngredientsId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [menuIngredients, setMenuIngredients] = useState([]);
    const [menuName, setMenuName] = useState(''); // state สำหรับชื่อเมนู

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const response = await axios.get(`${url}/api/menu/list`);
                if (response.data.success) {
                    setMenus(response.data.data);
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลเมนู: " + (error.response?.data?.message || error.message));
            }
        };
        fetchMenus();
    }, [url]);

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const response = await axios.get(`${url}/api/ingredient/listIngred`);
                if (response.data.success) {
                    setIngredients(response.data.data);
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุดิบ: " + (error.response?.data?.message || error.message));
            }
        };
        fetchIngredients();
    }, [url]);

    useEffect(() => {
        if (menuId) {
            loadMenuIngredients(menuId);
            const selectedMenu = menus.find(menu => menu.menu_id === menuId);
            setMenuName(selectedMenu ? selectedMenu.menu_name : ''); // ตั้งชื่อเมนูที่เลือก
        }
    }, [menuId, menus]);

    const addMenuIngredient = async (e) => {
        e.preventDefault();
        if (!menuId || !ingredientsId || !quantity) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        try {
            const response = await axios.post(`${url}/api/tuse/addMenuIngred`, {
                menu_id: menuId,
                ingredients: [{ ingredients_id: ingredientsId, unit, quantity }]
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setQuantity('');
                setIngredientsId('');
                setUnit('');
                loadMenuIngredients(menuId);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message));
        }
    };

    const removeIngredient = async (menuId, ingredientsId) => {
        const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบวัตถุดิบออกจากเมนู?");
        if (!confirmDelete) return;

        if (!menuId || !ingredientsId) {
            toast.error("กรุณาเลือกเมนูและวัตถุดิบ");
            return;
        }

        console.log("Removing ingredient with menuId:", menuId, "and ingredientsId:", ingredientsId); // ตรวจสอบข้อมูลที่ส่งไป

        try {
            const response = await axios.delete(`${url}/api/tuse/removeMenuIngred/${menuId}/${ingredientsId}`);

            if (response.data.success) {
                toast.success(response.data.message);
                loadMenuIngredients(menuId); // โหลดข้อมูลใหม่หลังจากลบสำเร็จ
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message));
        }
    };


    const updateIngredient = async (ingredientsId, currentQuantity) => {
        const newQuantity = prompt("กรุณากรอกปริมาณใหม่", currentQuantity);
        if (newQuantity) {

            const selectedIngredient = ingredients.find(ing => ing.ingredients_id === ingredientsId);
            const unit = selectedIngredient ? selectedIngredient.ingredients_unit : '';

            try {
                const response = await axios.put(`${url}/api/tuse/editMenuIngred`, {
                    menu_id: menuId,
                    ingredients_id: ingredientsId,
                    unit,
                    quantity: newQuantity
                });
                if (response.data.success) {
                    toast.success(response.data.message);
                    loadMenuIngredients(menuId);
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error("เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message));
            }
        }
    };

    const loadMenuIngredients = async (menuId) => {
        try {
            const response = await axios.get(`${url}/api/tuse/listMenuIngred/${menuId}`);
            console.log("Menu Ingredients Data:", response.data.data); // ตรวจสอบโครงสร้างข้อมูล
            setMenuIngredients(response.data.data || []);
        } catch (error) {
            console.error("Error loading menu ingredients:", error);
        }
    };

    useEffect(() => {
        if (!Sale && !token) {
            toast.error("กรุณาเข้าสู่ระบบก่อน");
            navigate("/");
        }
    }, [])

    return (
        <div className="container">
            <h2>จัดการวัตถุดิบในเมนู</h2>
            <form onSubmit={addMenuIngredient}>
                <label>เลือกเมนู:</label>
                <select value={menuId} onChange={e => setMenuId(e.target.value)}>
                    <option value="">เลือกเมนู</option>
                    {menus.map(menu => (
                        <option key={menu.menu_id} value={menu.menu_id}>{menu.menu_name}</option>
                    ))}
                </select>
                <label>เลือกวัตถุดิบ:</label>
                <select value={ingredientsId} onChange={e => {
                    setIngredientsId(e.target.value);
                    const selectedIngredient = ingredients.find(ing => ing.ingredients_id === e.target.value);
                    if (selectedIngredient) {
                        setUnit(selectedIngredient.ingredients_unit); // ดึงหน่วยจาก API
                    }
                }}>
                    <option value="">เลือกวัตถุดิบ</option>
                    {ingredients.map(ingredient => (
                        <option key={ingredient.ingredients_id} value={ingredient.ingredients_id}>
                            {ingredient.ingredients_name}
                        </option>
                    ))}
                </select>
                <label>ปริมาณ:</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="กรุณาป้อนปริมาณ" />
                <button className='menuIngred-add-button' type="submit">เพิ่มวัตถุดิบ</button>
            </form>
            <h3>{menuName ? `วัตถุดิบในเมนู: ${menuName}` : "เลือกเมนูเพื่อดูวัตถุดิบ"}</h3>
            <table>
                <thead>
                    <tr>
                        <th>ชื่อวัตถุดิบ</th>
                        <th>ปริมาณ</th>
                        <th>หน่วย</th>
                        <th>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {menuIngredients.length > 0 ? (
                        menuIngredients.map((item, index) => (
                            <tr key={`${item.ingredient.ingredients_id}-${index}`}>
                                <td>{item.ingredient.ingredients_name}</td>
                                <td>{item.quantity}</td>
                                <td>{item.ingredient.ingredients_unit}</td>
                                <td>
                                    <button className='menuIngred-del-button' onClick={() => { console.log("item:", item); removeIngredient(item.menu_id, item.ingredients_id) }}>ลบ</button>
                                    <button className='menuIngred-edit-button' onClick={() => updateIngredient(item.ingredients_id, item.quantity)}>แก้ไข</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4">ไม่มีวัตถุดิบ</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MenuIngred;
