import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import AddIngredient from './pages/Ingredient/ingredientAdd'
import ListIngredients from './pages/Ingredient/ingredientList'
import UseIngredients from './pages/Use/Calculate'
import Edit from './pages/Edit/Edit'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MenuIngred from './pages/Use/MenuIngred';
import IngredientEdit from './pages/Ingredient/ingredientEdit';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './components/Login/Login';
import OrderSystemControl from './pages/setOrders/setOrders';


const App = () => {

  const url = "http://localhost:4000"

  return (
    <div>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className='app-content'>
        <Sidebar />
        <Routes>
          <Route path="/" element={<Login url={url} />} />
          <Route path="/add" element={<Add url={url} />} />
          <Route path="/list" element={<List url={url} />} />
          <Route path="/orders" element={<Orders url={url} />} />
          <Route path="/addingredient" element={<AddIngredient url={url} />} />
          <Route path="/listingredients" element={<ListIngredients url={url} />} />
          <Route path="/useingredients" element={<UseIngredients />} />
          <Route path="/edit" element={<Edit url={url} />} />
          <Route path="/MenuIngred" element={<MenuIngred url={url} />} />
          <Route path="/ingredientEdit" element={<IngredientEdit url={url} />} />
          <Route path="/dashboard" element={<Dashboard url={url} />} />
          <Route path="/setOrders" element={<OrderSystemControl />} />
        </Routes>

      </div>
    </div>
  );
};

export default App;