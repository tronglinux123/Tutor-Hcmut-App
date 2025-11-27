import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

import book1 from '../image/book1.png';
import study1 from '../image/study1.png';
import write1 from '../image/write1.png';
import brown1 from '../image/brown1.png';
import magnetclass1 from '../image/magnetclass1.png';
import magnetuser1 from '../image/magnetuser1.png';

import book2 from '../image/book2.png';
import study2 from '../image/study2.png';
import write2 from '../image/write2.png';
import brown2 from '../image/brown2.png';
import magnetclass2 from '../image/magnetclass2.png';
import magnetuser2 from '../image/magnetuser2.png';

const sidebarItemss = {
  guest: [
    { id: 1, name: "Thư viện", icon: book1, hoverIcon: book2, path:'/library' },
  ],
  mentee: [
    { id: 1, name: "Thư viện", icon: book1, hoverIcon: book2, path:'/library' },
    { id: 2, name: "Lớp học", icon: study1, hoverIcon: study2, path:'/study' }, 
  ],
  mentor: [
    { id: 1, name: "Thư viện", icon: book1, hoverIcon: book2, path:'/library' },
    { id: 3, name: "Tùy chỉnh lớp học", icon: write1, hoverIcon: write2, path:'/settingstudy' }, 
  ],
  admin: [
    { id: 4, name: "Quản lý người dùng", icon: magnetuser1, hoverIcon: magnetuser2, path:'/user_management' }, 
    { id: 5, name: "Quản lý lớp học", icon: magnetclass1, hoverIcon: magnetclass2, path:'/class_management' }, 
    { id: 6, name: "Duyệt hồ sơ Mentor", icon: brown1, hoverIcon: brown2, path:'/browse_mentor' }, 
  ]
};  

function Sidebar() {
  const role = localStorage.getItem('userRole') || 'guest';
  const sidebarItems = sidebarItemss[role] || [];
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.id}>
            <NavLink 
              to={item.path} 
              className={({isActive})=>`sidebar-item ${isActive ? 'active' : ''}`
              }
            >
                <img
                  src={item.icon}
                  alt={item.name}
                  className='sidebar-icon-default'
                />
                <img
                  src={item.hoverIcon}
                  alt={item.name + " hover"}
                  className='sidebar-icon-hover'
                />
                <span className='menu-name'>{item.name}</span>
            </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;