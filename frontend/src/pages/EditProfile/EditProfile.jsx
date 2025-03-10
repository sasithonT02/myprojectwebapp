import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./editProfile.css";

const EditProfile = ({ url, user_id }) => {
  const [profile, setProfile] = useState(null);
  const [dataEdit, setDataEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const token = localStorage.getItem("token");

  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${url}/api/customer/user/${user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setProfile(response.data.data); // ตั้งค่าโปรไฟล์
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [url, user_id, token]);

  // ฟังก์ชันเปิดโหมดแก้ไข
  const startEditing = () => {
    setDataEdit({ ...profile }); // คัดลอกข้อมูลจากโปรไฟล์มาแก้ไข
    setIsEditing(true);
  };

  // ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงค่าใน input
  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setDataEdit((prev) => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันส่งข้อมูลที่แก้ไขกลับไปยัง backend
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.put(`${url}/api/customer/user/${user_id}`, dataEdit, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success("อัปเดตโปรไฟล์สำเร็จ!");
        setProfile(dataEdit); // อัปเดตข้อมูลที่แสดงผล
        setIsEditing(false); // ปิดโหมดแก้ไข
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
      console.error(error);
    }
  };

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="editProfile">
      {/* ✅ แสดงโปรไฟล์ก่อน */}
      {!isEditing ? (
        <div className="profileView">
          <h2>ข้อมูลโปรไฟล์</h2>
          <p><strong>ชื่อ:</strong> {profile?.cust_name}</p>
          <p><strong>ที่อยู่:</strong> {profile?.address}</p>
          <p><strong>เบอร์โทรศัพท์:</strong> {profile?.phone_number}</p>
          <button className="editProfileBtn" onClick={startEditing}>แก้ไขโปรไฟล์</button>
        </div>
      ) : (
        // ✅ แสดงฟอร์มแก้ไขเมื่อกดปุ่ม "แก้ไขโปรไฟล์"
        <form className="editProfileForm flex-col" onSubmit={onSubmitHandler}>
          <div className="editProfileField flex-col">
            <label htmlFor="cust_name">ชื่อ</label>
            <input
              type="text"
              id="cust_name"
              name="cust_name"
              value={dataEdit.cust_name}
              onChange={onChangeHandler}
              required
            />
          </div>
          <div className="editProfileField flex-col">
            <label htmlFor="address">ที่อยู่</label>
            <textarea
              id="address"
              name="address"
              value={dataEdit.address}
              onChange={onChangeHandler}
              required
            ></textarea>
          </div>
          <div className="editProfileField flex-col">
            <label htmlFor="phone_number">เบอร์โทรศัพท์</label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={dataEdit.phone_number}
              onChange={onChangeHandler}
              maxLength={10}
              required
            />
          </div>
          <button type="submit" className="editProfileBtn">บันทึก</button>
          <button type="button" className="cancelBtn" onClick={() => setIsEditing(false)}>ยกเลิก</button>
        </form>
      )}
    </div>
  );
};

export default EditProfile;
