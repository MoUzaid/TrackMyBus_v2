import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Home from './components/User/Home';
import RegisterDriver from './components/Driver/RegisterDriver';
import LoginDriver from './components/Driver/LoginDriver';
import LoginUser from './components/User/LoginUser';
import RegisterUser from './components/User/RegisterUser';
import Dashboard from './components/Admin/Dashboard';
import Students from './components/Admin/Students';
import PickupPoints from './components/Admin/PickupPoints';
import MyMap from './components/Maps/MyMap';
import UserMap from './components/Maps/UserMap';
import CreateBus from "./components/Bus/CreateBus";
import EditBus from "./components/Bus/EditBus";
import DriverHome from './components/Driver/DriverHome';
import ForgotPass from './components/User/ForgotPass';
import ResetPass from './components/User/ResetPass';
import Forgot from './components/Driver/Forgot';
import Reset from './components/Driver/Reset';
import AdminMap from './components/Maps/AdminMap';

const Pages = () => {
  return (
    <div>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginUser />} />
      <Route path="/driver-login" element={<LoginDriver />} />
      <Route path="/register" element={<RegisterUser />} />
      <Route path="/driver-home" element={<DriverHome/>}/>
      <Route path="/driver-register" element={<RegisterDriver />} />
      <Route path="/Dashboard" element={<Dashboard/>}/>
      <Route path="/view-students/:busId" element={<Students/>}/>
      <Route path="/pickup_points/:id" element={<PickupPoints/>}/>
      <Route path="/map" element={<MyMap/>}/>
      <Route path="/user-map" element={<UserMap/>}/>
      <Route path="/create-bus" element={<CreateBus/>}/>
      <Route path="/edit-bus/:busId" element={<EditBus/>}/>
      <Route path="/forgot-password" element={<ForgotPass/>}/>
      <Route path="/reset-password/:token" element={<ResetPass/>}/>
      <Route path="/forgot-password-driver" element={<Forgot/>}/>
      <Route path="/reset-password-driver/:token" element={<Reset/>}/>
      <Route path="/admin_map/:busId" element={<AdminMap/>}/>
    </Routes>
    </div>
  )
}

export default Pages