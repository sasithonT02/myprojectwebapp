import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyOrders.css";
import { toast } from "react-toastify";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const url = "http://localhost:4000";
  const token = localStorage.getItem("token");
  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/listOrder`,
        {
          headers: { Authorization: `Bearer ${token}` },
        });
      setOrders(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Error fetching orders. Please try again later.");
    }
  };


  const cancelOrder = async (orderId) => {
    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อ?");
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${url}/api/order/removeOrder/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        toast.success("ยกเลิกคำสั่งซื้อสำเร็จ");
        fetchOrders(); // โหลดรายการใหม่
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      toast.error("แม่ค้าได้ดำเนินการกับคำสั่งซื้อแล้ว ไม่สามารถยกเลิกได้");
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="my-orders">
      <h2>ประวัติการสั่งซื้อ</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="orders-list">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.order_id} className="order-item">
              <div className="order-header">
                <div>
                  <p>วันที่สั่งซื้อ: {new Date(order.order_date).toLocaleDateString("th-TH", options)}</p>
                  <p>วันที่ทำการจัดส่ง: {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString("th-TH", options) : "รอดำเนินการ"}</p>
                  <p>สถานะการชำระเงิน: {order.payment_status || "รอดำเนินการ"}</p>
                  <p>ราคารวม: {order.total_price ? order.total_price.toLocaleString() + " บาท" : "ไม่ระบุ"}</p>
                </div>
                <div className="order-actions">
                  <button className="order-button" onClick={() => toggleOrderDetails(order.order_id)}>
                    {expandedOrderId === order.order_id ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
                  </button>
                  {/*{order.payment_status !== "จ่ายแล้ว" && order.payment_status !== "ยังไม่จ่าย" && (
                    <button className="cancel-button" onClick={() => cancelOrder(order.order_id)}>ยกเลิกคำสั่งซื้อ</button>
                  )}*/}
                </div>
              </div>
              {expandedOrderId === order.order_id && (
                <div className="order-details">
                  <h4>รายละเอียดการสั่งซื้อ:</h4>
                  <ul>
                    {order.order_details
                      .filter((detail) => detail.quantity > 0)
                      .map((detail, index) => (
                        <li key={`${order.order_id}-${index}`}>
                          <p>ชื่อเมนู: {detail.menu_name}</p>
                          <p>จำนวน: {detail.quantity} รายการ</p>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>ไม่มีคำสั่งซื้อ</p>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
