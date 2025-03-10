import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const url = "http://localhost:4000";
    const [token, setToken] = useState("");
    const [customer, setCustomer] = useState(false);
    const [menu_list, setMenuList] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        const savedCartItems = JSON.parse(localStorage.getItem("cartItems"));
        if (savedCartItems) {
            setCartItems(savedCartItems);
        }
    }, []);

    // เพิ่มเมนูอาหารลงตะกร้า
    const addToCart = async (menu_id) => {
        if (!menu_id) {
            console.error("addToCart: menu_id is undefined");
            return;
        }
        setCartItems((prev) => {
            const newItems = { ...prev };
            newItems[menu_id] = (newItems[menu_id] || 0) + 1;
            return newItems;
        });
        if (token) {
            try {
                const response = await axios.post(url + "/api/cart/add", { menu_id },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                toast.success("เพิ่มสินค้าลงในตะกร้าแล้ว");
                console.log("addToCart response:", response.data);
                if (!response.data.success) {
                    console.error("addToCart error: ไม่ได้รับอนุญาต");
                }
            } catch (error) {
                console.error("addToCart error:", error);
            }
        } else {
            toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        }
    };


    // ลบเมนูอาหารออกจากตะกร้า
    const removeFromCart = async (menu_id) => {
        if (!menu_id) {
            console.error("removeFromCart: menu_id is undefined");
            return;
        }
        setCartItems((prev) => {
            const newItems = { ...prev };
            if (newItems[menu_id] > 1) {
                newItems[menu_id] -= 1;
            } else {
                delete newItems[menu_id];
            }
            return newItems;
        });
        if (token) {
            try {
                const response = await axios.post(url + "/api/cart/remove", { menu_id },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                toast.success("ลบสินค้าออกจากตะกร้าแล้ว");
                console.log("removeFromCart response:", response.data);
                if (!response.data.success) {
                    console.error("removeFromCart error: ไม่ได้รับอนุญาต");
                }
            } catch (error) {
                console.error("removeFromCart error:", error);
            }
        } else {
            console.error("removeFromCart error: ไม่มี token ที่ใช้ได้");
        }
    };


    // คำนวณราคารวมของเมนูอาหารทั้งหมดในตะกร้า
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = menu_list.find((product) => product.menu_id == item);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            };
        };
        return totalAmount;
    };


    // ดึงข้อมูลเมนูอาหารทั้งหมดจาก API
    const fetchMenuList = async () => {
        try {
            const response = await axios.get(url + "/api/menu/list");
            setMenuList(response.data.data);
        } catch (error) {
            console.error("fetchMenuList error:", error);
        }
    };


    // โหลดข้อมูลตะกร้าสินค้าจาก API
    const loadCartData = async (token) => {
        if (!token) {
            console.error("loadCartData error: No token provided");
            return;
        }

        try {
            const response = await axios.post(url + "/api/cart/get", {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                });
            if (response.data.success && response.data.cartItems) {
                const apiCartData = response.data.cartItems.reduce((acc, item) => {
                    acc[item.menu_id] = item.quantity;
                    return acc;
                }, {});
                setCartItems(apiCartData);
            } else {
                console.error("loadCartData error: No cartItems found in response");
            }
        } catch (error) {
            console.error("loadCartData error:", error);
        }
    };


    // สั่งซื้อเมนูอาหารทั้งหมดในตะกร้า
    const placeOrder = async () => {
        if (!token) {
            toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
            return;
        }

        try {
            const settingsResponse = await axios.get(url + "/api/settings");
            const { open_time, close_time } = settingsResponse.data;
            const currentTime = new Date().toISOString().split('T')[1].substring(0, 5); // เอาเวลาในรูปแบบ HH:mm
            if (currentTime > close_time) {
                toast.error("ปิดรับออเดอร์แล้วในขณะนี้");
                return;
            }
            const orderDetails = Object.keys(cartItems).map(menu_id => ({
                menu_id: parseInt(menu_id),
                quantity: cartItems[menu_id]
            }));
            const orderResponse = await axios.post(url + "/api/order/addOrder", { order_details: orderDetails },
                {
                    headers: { Authorization: `Bearer ${token}` }
                });

            if (orderResponse.data.success) {
                setCartItems({});
                toast.success(orderResponse.data.message);
                navigate("/myorders");
            } else {
                toast.error(orderResponse.data.message);
            }
        } catch (error) {
            console.error("placeOrder error:", error);
            if (error.response && error.response.status === 403) {
                toast.error("ขณะนี้ปิดรับออเดอร์แล้ว");
            } else {
                toast.error("เกิดข้อผิดพลาดในการสั่งซื้อ");
            }
        }
    };


    // โหลดข้อมูลจาก localStorage หลังจากโหลดหน้าเว็บเสร็จ
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedCartItems = JSON.parse(localStorage.getItem("cartItems"));
        if (storedToken) {
            setToken(storedToken);
            loadCartData(storedToken);
        } else {
            if (storedCartItems) {
                setCartItems(storedCartItems);
            } else {
                setCartItems({});
            }
        }
        fetchMenuList();
    }, []);


    // โหลดข้อมูลตะกร้าจาก API เมื่อ token เปลี่ยนแปลง
    useEffect(() => {
        if (token) {
            loadCartData(token);
        }
    }, [token]);


    // บันทึกข้อมูล cartItems ลง localStorage เมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        if (cartItems && Object.keys(cartItems).length > 0) {
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
        } else {
            localStorage.removeItem("cartItems");
        }
    }, [cartItems]);


    // บันทึกข้อมูล token ลง localStorage เมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        const filteredCart = Object.fromEntries(
            Object.entries(cartItems).filter(([_, quantity]) => quantity > 0)
        );
        localStorage.setItem("cartItems", JSON.stringify(filteredCart));
    }, [cartItems]);


    // บันทึกข้อมูล token ลง localStorage เมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("cartItems");
        }
    }, [token]);


    // ไม่มี token ตะกร้าว่าง
    useEffect(() => {
        if (!token) {
            setCartItems({});
            localStorage.removeItem("cartItems");
        }
    }, [token]);


    // role customer
    useEffect(() => {
        async function loadData() {
            if (localStorage.getItem("Customer")) {
                setCustomer(localStorage.getItem("Customer"));
            };
        };
        loadData();
    }, []);

    
    const contextValue = {
        menu_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        placeOrder,
        url,
        token,
        setToken,
        customer,
        setCustomer,
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
