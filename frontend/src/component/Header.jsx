import React, { useState, useRef, useEffect } from 'react';
import logoimg from '../image/logo.webp';
import avt from '../image/avatar.png';
import { NavLink } from 'react-router-dom';
import './Header.css';
import ProfileModal from '../pages/ProfileModal'; // ✅ thêm modal hồ sơ

const storage = localStorage;   

function Header() {
    const [open, setOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isLogin, setIslogin] = useState(false);
    const [openProfile, setOpenProfile] = useState(false); // ✅ popup hồ sơ
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const checkStatus = () => {
            const role = storage.getItem('userRole');
            if (role) {
                setUserRole(role);
                setIslogin(true);
            } else {
                setIslogin(false);
                setUserRole(null);
            }
        };
        checkStatus();
    }, []);

    const handleLogout = () => {
        storage.removeItem('userRole');
        storage.removeItem('emailCurrent');
        storage.removeItem('nameCurrent');
        setIslogin(false);
        setUserRole(null);
        window.location.reload();
    };

    const handleProfile = () => {
        setOpen(false);
        setOpenProfile(true); // ✅ mở popup
    };

    return (
        <>
            <header className="header">
                <div className="block1">
                    <div className="menu">
                        <div className="sen"></div>
                        <div className="sen"></div>
                        <div className="sen"></div>
                    </div>
                    <div className="logo">
                        <NavLink to='/'><img src={logoimg} alt="logobk" className="logo_Bk" /></NavLink>
                        <h1 className="tutor">TUTOR</h1>
                    </div>
                </div>

                <div className="block2">
                    <div className='auth-section'>
                        {isLogin ? (
                            <div className='avt-container'>
                                <button className='avt' ref={buttonRef} onClick={() => setOpen(!open)}>
                                    <img src={avt} alt='' className='avtimg' />
                                </button>
                                {open && (
                                    <ul ref={menuRef} className='menuavt'>
                                        <li onClick={handleProfile}>Thông tin cá nhân</li> {/* ✅ mở modal */}
                                        <li onClick={handleLogout}>Đăng xuất</li>
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <NavLink to='/login'>
                                <button className="DN">
                                    <h1 className="letterDN">Đăng Nhập</h1>
                                </button>
                            </NavLink>
                        )}
                    </div>
                </div>
            </header>

            {/* ✅ Hiển thị popup hồ sơ mentee */}
            <ProfileModal open={openProfile} onClose={() => setOpenProfile(false)} />
        </>
    );
}

export default Header;
