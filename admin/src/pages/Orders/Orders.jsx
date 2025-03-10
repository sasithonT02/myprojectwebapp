import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Orders.css";


const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const url = "http://localhost:4000";
  const token = localStorage.getItem("token");
  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${url}/api/order/getAllOrder`,
          {
            headers: { Authorization: `Bearer ${token}` },
          });
        console.log("Fetched Orders Data:", response.data);
        setOrders(response.data.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [token]);

  const updateOrder = async (order_id, delivery_date, payment_status) => {
    try {
      const response = await axios.put(
        `${url}/api/order/editOrder/${order_id}`,
        { delivery_date, payment_status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Order updated:", response.data);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === order_id
            ? { ...order, delivery_date, payment_status }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // ฟังก์ชันจัดกลุ่มคำสั่งซื้อตามวันที่
  const groupOrdersByDate = (orders) => {
    return orders.reduce((acc, order) => {
      const date = new Date(order.order_date).toLocaleDateString("th-TH", options);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(order);
      return acc;
    }, {});
  };

  const groupedOrders = groupOrdersByDate(orders);

  return (
    <div className="orders">
      <h2>จัดการคำสั่งซื้อ</h2>
      <div className="orders-list">
        {Object.keys(groupedOrders).length > 0 ? (
          Object.keys(groupedOrders).map((date, index) => (
            <div key={date}>
              {/* แสดงวันที่เป็นหัวข้อ */}
              <h3 className="order-date">วันที่: {date}</h3>
              <hr className="order-divider" />
              {groupedOrders[date].map((order) => (
                <div key={order.order_id} className="order-item">
                  <div className="order-header">
                    <h3>เลขที่สั่งซื้อ: {order.order_id}</h3>
                    <button
                      className="details-button"
                      onClick={() =>
                        setSelectedOrderId(
                          selectedOrderId === order.order_id ? null : order.order_id
                        )
                      }
                    >
                      {selectedOrderId === order.order_id ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
                    </button>
                  </div>
                  <p>วันที่สั่งซื้อ: {new Date(order.order_date).toLocaleDateString("th-TH", options)}</p>
                  <p>
                    วันที่ทำการจัดส่ง:{" "}
                    {order.delivery_date
                      ? new Date(order.delivery_date).toLocaleDateString("th-TH", options)
                      : "รอดำเนินการ"}
                  </p>
                  <p>สถานะการชำระเงิน: {order.payment_status || "รอดำเนินการ"}</p>
                  <p>ราคารวม: {order.total_price.toLocaleString() + " บาท"}</p>
                  {selectedOrderId === order.order_id && (
                    <div className="order-details">
                      <h4>ข้อมูลลูกค้า</h4>
                      <p>ชื่อ: {order.customer?.name || "N/A"}</p>
                      <p>ที่อยู่: {order.customer?.address || "N/A"}</p>
                      <p>เบอร์โทร: {order.customer?.phone || "N/A"}</p>
                      <br />
                      <h4>รายการอาหาร</h4>
                      {order.order_details && order.order_details.length > 0 ? (
                        <div>
                          {order.order_details.map((detail) => (
                            <div key={detail.detail_id} className="menu-item">
                              <p>เมนู: {detail.menu_name}</p>
                              <p>จำนวน: {detail.quantity} รายการ</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>ไม่มีข้อมูลรายการอาหาร</p>
                      )}
                    </div>
                  )}
                  <div className="order-actions">
                    <label>
                      วันที่ทำการจัดส่ง:
                      <input
                        type="date"
                        value={
                          order.delivery_date
                            ? new Date(order.delivery_date).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          updateOrder(order.order_id, e.target.value, order.payment_status)
                        }
                      />
                    </label>
                    <label>
                      สถานะการชำระเงิน:
                      <select
                        value={order.payment_status || ""}
                        onChange={(e) =>
                          updateOrder(order.order_id, order.delivery_date, e.target.value)
                        }
                      >
                        <option value="">รอดำเนินการ</option>
                        <option value="จ่ายแล้ว">จ่ายแล้ว</option>
                        <option value="ยังไม่จ่าย">ยังไม่จ่าย</option>
                      </select>
                    </label>
                  </div>
                </div>
              ))}
              {/* เส้นแบ่งระหว่างวัน */}
              {index < Object.keys(groupedOrders).length - 1 && <hr className="day-divider" />}
            </div>
          ))
        ) : (
          <p>ไม่มีรายการคำสั่งซื้อ</p>
        )}
      </div>
    </div>
  );
};

export default Orders;