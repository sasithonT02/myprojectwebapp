import React, { useContext, useEffect, useState } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';

const Cart = () => {
  const { cartItems, setCartItems, menu_list, addToCart, removeFromCart, getTotalCartAmount, placeOrder, url } = useContext(StoreContext);
  const [isCartEmpty, setIsCartEmpty] = useState(false);


  useEffect(() => {
    const savedCartItems = JSON.parse(localStorage.getItem('cartItems'));
    if (savedCartItems) {
      setCartItems(savedCartItems);
    }
  }, [setCartItems]);


  useEffect(() => {
    if (!cartItems || Object.keys(cartItems).length === 0) {
      setIsCartEmpty(true);
    } else {
      setIsCartEmpty(false);
    }
  }, [cartItems]);


  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>เมนู</p>
          <p>ชื่อ</p>
          <p>ราคา (บาท)</p>
          <p>จำนวน</p>
          <p>รวม (บาท)</p>
          <p>เพิ่ม</p>
          <p>ลบ</p>
        </div>
        <br />
        <hr />
        {isCartEmpty ? (
          <p>ไม่มีสินค้าบนตะกร้า</p>
        ) : (
          menu_list.length > 0 && menu_list.map((item, index) => {
            if (cartItems && cartItems[item.menu_id] > 0) {
              return (
                <div key={item.menu_id}>
                  <div className='cart-items-title cart-items-item'>
                    <img src={url + "/images/" + item.image} alt={item.menu_name} />
                    <p>{item.menu_name}</p>
                    <p>{item.price}</p>
                    <p>{cartItems[item.menu_id]}</p>
                    <p>{(item.price * cartItems[item.menu_id]).toFixed(2)}</p>
                    <button onClick={() => addToCart(item.menu_id)} className="add-cart-btn">+</button>
                    <button onClick={() => removeFromCart(item.menu_id)} className="remove-cart-btn">-</button>
                  </div>
                  <hr />
                </div>
              )
            }
          })
        )}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <div className="cart-total-details">
            <b>รวมทั้งหมด</b>
            <b>{getTotalCartAmount()} บาท</b>
          </div>
          <button onClick={placeOrder}>สั่งซื้อ</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
