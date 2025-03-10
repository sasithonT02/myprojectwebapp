import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Calculate.css";

const Calculate = () => {
  
  const url = "http://localhost:4000";
  const [menus, setMenus] = useState([]);
  const [summary, setSummary] = useState({ total_ingredients: [], total_price: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };



  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today); // ใช้ setDate แทน setSelectedDate
  }, []);
  

  useEffect(() => {
    const fetchIngredients = async () => {
      if (!date) return; // ไม่ทำการดึงข้อมูลหากวันที่ว่าง
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/order/ingredientUsage?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMenus(response.data.data.menus || []);
        setSummary(response.data.data.summary || { total_ingredients: [], total_price: 0 });
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        setError("ไม่สามารถโหลดข้อมูลวัตถุดิบได้");
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, [date]); // เรียก fetchIngredients ทุกครั้งที่ date เปลี่ยนแปลง

  return (
    <div className="calculate-container">
      <h2>การคำนวณวัตถุดิบที่ต้องใช้</h2>

      {/* ป้อนวันที่ */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/*{loading && <p>⏳ กำลังโหลดข้อมูล...</p>}*/}
      {error && <p className="error-text">❌ {error}</p>}

      {!loading && !error && (
        <>
          {/* แสดงวันที่ */}
          {date && <h3>ข้อมูลการคำนวณวัตถุดิบสำหรับวันที่: {new Date(date).toLocaleDateString("th-TH", options)}</h3>}

          {/* แสดงวัตถุดิบของแต่ละเมนู */}
          {menus.length > 0 ? (
            <div>
              {menus.map((menu, index) => (
                <div key={index} className="cal-menu-section">
                  <h3>เมนู: {menu.menu_name} {menu.total_quantity} รายการ</h3>
                  <ul className="cal-ingredient-list">
                    {menu.ingredients.map((item, i) => (
                      <li key={i} className="cal-ingredient-item">
                        <span className="cal-ingredient-name">{item.ingredients_name}</span>
                        <span className="cal-ingredient-quantity">
                          {item.total_quantity} {item.ingredients_unit}
                        </span>
                        <span className="cal-ingredient-price">
                          ฿{(item.price * item.total_quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p>⚠️ ไม่มีข้อมูลเมนู</p>
          )}

          {/* สรุปการใช้วัตถุดิบทั้งหมด */}
          <h2>สรุปการใช้วัตถุดิบทั้งหมด</h2>
          <ul className="cal-ingredient-list">
            {summary.total_ingredients.map((item, index) => (
              <li key={index} className="cal-ingredient-item">
                <span className="cal-ingredient-name">{item.ingredients_name}</span>
                <span className="cal-ingredient-quantity">
                  {item.total_quantity} {item.ingredients_unit}
                </span>
                <span className="cal-ingredient-price">
                  ฿{(item.price * item.total_quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="cal-total-price">
            <h3>ราคาทั้งหมด: ฿{summary.total_price}</h3>
          </div>
        </>
      )}
    </div>
  );
};

export default Calculate;