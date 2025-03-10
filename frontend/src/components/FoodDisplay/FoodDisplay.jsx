import React, { useContext } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';


const FoodDisplay = () => {
  const { menu_list } = useContext(StoreContext);

  return (
    <div className='food-display' id='food-display'>
      <h2>เมนูสำหรับคุณลูกค้าวันนี้</h2>
      <div className="food-display-list">
        {menu_list.map((menu, menu_id) => {
          return (
            <FoodItem
              key={menu_id}
              id={menu.menu_id}
              name={menu.menu_name}
              description={menu.description}
              price={menu.price}
              image={menu.image}
            />
          )
        })}
      </div>
    </div>
  );
};

export default FoodDisplay;