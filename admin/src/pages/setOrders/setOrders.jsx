import { useEffect, useState } from "react";
import "./setOrders.css";
import { toast } from "react-toastify";

function OrderSystemControl() {
    const [openTime, setOpenTime] = useState("");
    const [closeTime, setCloseTime] = useState("");

    // โหลดค่าเวลาปัจจุบัน
    useEffect(() => {
        fetch("http://localhost:4000/api/settings")
            .then(res => res.json())
            .then(data => {
                setOpenTime(data.open_time);
                setCloseTime(data.close_time);
            });
    }, []);

    // อัปเดตเวลาไปที่เซิร์ฟเวอร์
    const updateSettings = async () => {
        const response = await fetch("http://localhost:4000/api/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ open_time: openTime, close_time: closeTime })
        });

        if (response.ok) {
            toast.success("อัปเดตเวลาสำเร็จ!");
        } else {
            toast.error("เกิดข้อผิดพลาด");
        }
    };

    return (
        <div className="setorders">
            <h2>ตั้งค่าเวลาเปิด-ปิดการสั่งซื้อ</h2>
            <label>เวลาเปิด: </label>
            <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} />
            <br />
            <label>เวลาปิด: </label>
            <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
            <br />
            <button onClick={updateSettings}>บันทึก</button>
        </div>
    );
}

export default OrderSystemControl;
