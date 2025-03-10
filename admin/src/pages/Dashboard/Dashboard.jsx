import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./Dashboard.css";
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

const Dashboard = ({ url }) => {
  const { token, Sale } = useContext(StoreContext);
  const [orderSummary, setOrderSummary] = useState({
    totalOrders: 0,
    completedAmount: 0,
    completedCustomers: [],
    pendingOrders: 0,
    pendingAmount: 0, // เพิ่ม pendingAmount
    pendingCustomers: [], // เพิ่ม pendingCustomers
    totalAmount: 0,
    totalIngredientCost: 0,
    menuSales: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [showCompletedCustomers, setShowCompletedCustomers] = useState(false);
  const [showPendingCustomers, setShowPendingCustomers] = useState(false); // สำหรับควบคุมการแสดงรายชื่อลูกค้าที่ยังไม่ชำระ
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedDate) params.date = selectedDate;

        const response = await axios.get(`${url}/api/order/summary`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        setOrderSummary({
          totalOrders: response.data.totalOrders || 0,
          completedAmount: response.data.completedAmount || 0,
          completedCustomers: response.data.completedCustomers || [],
          pendingOrders: response.data.pendingOrders || 0,
          pendingAmount: response.data.pendingAmount || 0, // รับ pendingAmount
          pendingCustomers: response.data.pendingCustomers || [], // รับ pendingCustomers
          totalAmount: response.data.totalAmount || 0,
          totalIngredientCost: response.data.totalIngredientCost || 0,
          menuSales: response.data.menuSales || [],
        });
      } catch (error) {
        console.error("Error fetching order summary:", error);
        setError("ไม่สามารถโหลดข้อมูลการสรุปคำสั่งซื้อ");
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchOrderSummary();
    }
  }, [url, token, selectedDate]);

  useEffect(() => {
    if (!Sale || !token) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      navigate("/");
    }
  }, [Sale, token, navigate]);

  return (
    <div className="dashboard-container">
      <h2>สรุปข้อมูล</h2><br />

      <div className="date-picker-container">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder="เลือกวันที่"
        />
      </div>

      {error && <p className="error-text">❌ {error}</p>}

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <>
          <div className="summary-card">
            <div className="summary-item">
              <span className="summary-label">จำนวนคำสั่งซื้อทั้งหมด</span>
              <span className="summary-value">{orderSummary.totalOrders}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">รวมเป็นเงินทั้งหมด</span>
              <span className="summary-value">฿{orderSummary.totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">ต้นทุนวัตถุดิบทั้งหมด</span>
              <span className="summary-value">฿{orderSummary.totalIngredientCost.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">กำไรหลังหักต้นทุนวัตถุดิบ</span>
              <span className="summary-value">฿{(orderSummary.totalAmount - orderSummary.totalIngredientCost).toFixed(2)}</span>
            </div>
          </div>

          <div className="menu-sales-container">
            <h3>ยอดขายเมนู</h3>
            {orderSummary.menuSales.length > 0 ? (
              <table className="menu-sales-table">
                <thead>
                  <tr>
                    <th>เมนู</th>
                    <th>จำนวนที่ขายได้</th>
                  </tr>
                </thead>
                <tbody>
                  {orderSummary.menuSales.map((menu, index) => (
                    <tr key={index}>
                      <td>{menu.menu_name}</td>
                      <td>{menu.total_sold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>ไม่มีข้อมูลยอดขายเมนู</p>
            )}
          </div>
          <br />
          <div className="summary-card">
            <div className="summary-item" onClick={() => setShowCompletedCustomers(!showCompletedCustomers)}>
              <span className="summary-label">ยอดรวมเงินที่จ่ายแล้ว</span>
              <span className="summary-value">฿{orderSummary.completedAmount.toFixed(2)}</span>
              <span className="toggle-button">{showCompletedCustomers ? "▲" : "▼"}</span>
              {showCompletedCustomers && (
                <ul className="customer-dropdown">
                  {orderSummary.completedCustomers.length > 0 ? (
                    orderSummary.completedCustomers.map((customer, index) => (
                      <li key={index}>{customer}</li>
                    ))
                  ) : (
                    <li>ไม่มีข้อมูล</li>
                  )}
                </ul>
              )}
            </div>

            <div className="summary-item" onClick={() => setShowPendingCustomers(!showPendingCustomers)}>
              <span className="summary-label">ยอดรวมเงินที่ยังไม่จ่าย</span>
              <span className="summary-value">฿{orderSummary.pendingAmount.toFixed(2)}</span>
              <span className="toggle-button">{showPendingCustomers ? "▲" : "▼"}</span>
              {showPendingCustomers && (
                <ul className="customer-dropdown">
                  {orderSummary.pendingCustomers.length > 0 ? (
                    orderSummary.pendingCustomers.map((customer, index) => (
                      <li key={index}>{customer}</li>
                    ))
                  ) : (
                    <li>ไม่มีข้อมูล</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;