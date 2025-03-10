import React, { useContext } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';


const FoodItem = ({ id, name, price, description, image }) => {
    const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);

    return (
        <div className='food-item'>
            <div className='food-item-img-container'>
                <img className='food-item-image' src={url + "/images/" + image} alt={name} />
            </div>
            <div className="food-item-info">
                <p>{name}</p>
            </div>
                <p className="food-item-desc">{description}</p>
                <p className="food-item-price">฿{price}</p>
            <div className="food-item-actions">
                {cartItems && cartItems[id] !== undefined ? (
                    <div className='food-item-counter'>
                        <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="Remove" />
                        <p>{cartItems[id]}</p>
                        <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="Add" />
                    </div>
                ) : (
                    <button className="add-to-cart-btn" onClick={() => addToCart(id)}>
                        <img src={assets.add_icon_white} alt="Add" />
                        หยิบใส่ตะกร้า
                    </button>
                )}
            </div>
        </div>
    );
};

export default FoodItem;