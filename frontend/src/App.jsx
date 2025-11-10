import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import AdminRoute from './component/AdminRoute';
import MenteeRoute from './component/MenteeRoute';
import MentorRoute from './component/MentorRoute';
// import MentorApplyRoute from './component/MentorApplyRoute';

import Home from './pages/Home';
import Library from './pages/Library';
import SettingStudy from './pages/SettingStudy';
import Study from './pages/Study';
import DangKyMonHoc from './pages/DangKyMonHoc'
// import Admin from './pages/Admin';
import User_management from './pages/User_management'
import Class_management from './pages/Class_management'
import Browse_mentor from './pages/Browse_mentor'

import Login from './layout/Login';
// import DKMentor from './layout/DKMentor';
import RootLayout from './layout/RootLayout';

import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Header from './component/Header';
import StudyDetail from './pages/StudyDetail'; // thêm import

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path='/' element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path='library' element={<Library />} />
          <Route path='settingstudy' element={<MentorRoute><SettingStudy /></MentorRoute>} />
          <Route path='study' element={<MenteeRoute><Study /></MenteeRoute>} />
          {/* Route chi tiết lớp cho mentee */}
          <Route path='study/class/:pairID' element={<MenteeRoute><StudyDetail /></MenteeRoute>} />
          <Route path='study/dangkymonhoc' element={<MenteeRoute><DangKyMonHoc /></MenteeRoute>} />
          <Route path='user_management' element={<AdminRoute><User_management /></AdminRoute>} />
          <Route path='class_management' element={<AdminRoute><Class_management /></AdminRoute>} />
          <Route path='browse_mentor' element={<AdminRoute><Browse_mentor /></AdminRoute>} />
        </Route>
        <Route path='/login' element={<Login />} />
        {/* <Route 
          path='/dangkymentor' 
          element={
            <MentorApplyRoute>
              <DKMentor />
            </MentorApplyRoute>
          } 
        /> */}
        {/* <Route 
          path='/admin'
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        /> */}
      </>
    )
  )

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App
