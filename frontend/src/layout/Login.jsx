import logoimg from '../image/logo.webp';
import emailimg from '../image/email.png';
import lock from '../image/lock.png';
import nameimg from '../image/name.png';
import phoneimg from '../image/phone.png';
import seximg from '../image/sex.webp';
import yearimg from '../image/year.png';
import facultyimg from '../image/faculty.png';
import jobimg from '../image/job.png';
import yearstudyimg from '../image/yearstudy.png';
import gpaimg from '../image/gpa.png';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import './Login.css';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  // đăng nhậ<p></p>
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // đăng kí
  const [name, setName] = useState('');
  const [email_dk, setEmailDk] = useState('');
  const [pass_dk, setPassDk] = useState('');
  const [pass_confirm, setPassConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [sex,setSex] = useState('');
  const [birthday,setBirthday] = useState('');

  const [job,setJob] = useState('');
  const [specialized,setSpecialized] = useState('');
  const [yearstudy,setYearstudy] = useState('');
  const [gpa,setGpa] = useState('');


  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  const [dkError, setDkError] = useState('');
  const [dkSuccess, setDkSuccess] = useState('');
  
  const BACKEND_URL = 'http://localhost:5000';
  const [move, setMove] = useState(false);
  const [movementor, setMovementor] = useState(false);

  const handleSubmit_login = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('')
    setDkError('');
    setDkSuccess('');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/login`,{
        email: email,
        password: password
      });
      setLoginSuccess(response.data.message); 
      setEmail('');
      setPassword('');
      const userRole = response.data.user.role;
      const emailCurrent = response.data.user.email;
      const nameCurrent = response.data.user.name;
      const Id = response.data.user.id;
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('emailCurrent', emailCurrent);
      localStorage.setItem('nameCurrent', nameCurrent);
      localStorage.setItem('id', Id);
      console.log('Đăng nhập thành công:', response.data);
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Đăng nhập thất bại.');
    }
  }

  const handleSubmit_Dk = async (e) => {
    e.preventDefault();
    setDkError('');
    setDkSuccess('');
    setLoginError('');
    setLoginSuccess('');
    if (pass_dk!=pass_confirm){
      setTimeout(() => {
            setDkError('Mật khẩu không trùng nhau');
      }, 0);
      return;
    }
    // console.log(name);
    // console.log(email_dk);
    // console.log(pass_dk);
    // console.log(phone);
    // console.log(sex);
    // console.log(birthday);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/register`,{
        name: name,
        email_dk: email_dk,
        pass_dk: pass_dk,
        phone: phone,
        gender: sex,
        birthday: birthday
      });
      setDkSuccess(response.data.message); 
      setName('');
      setEmailDk('');
      setPassDk('');
      setPassConfirm('');
      setPhone('');
      setSex('');
      setBirthday('');
      console.log('Đăng ký thành công:', response.data);
    } catch (error) {
      setDkError(error.response?.data?.message || 'Đăng ký thất bại.');
    }
  }

  const handleSubmit_Dkmentor = async (e) => {
    e.preventDefault();
    setDkError('');
    setDkSuccess('');
    setLoginError('');
    setLoginSuccess('');
    if (pass_dk!=pass_confirm){
      setTimeout(() => {
            setDkError('Mật khẩu không trùng nhau');
      }, 0);
      return;
    }
    console.log(name);
    console.log(email_dk);
    console.log(pass_dk);
    console.log(phone);
    console.log(sex);
    console.log(birthday);
    console.log(job);
    console.log(specialized);
    console.log(yearstudy);
    console.log(gpa);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/registermentor`,{
        name: name,
        email_dk: email_dk,
        pass_dk: pass_dk,
        phone: phone,
        gender: sex,
        birthday: birthday,
        job: job,
        specialized: specialized,
        yearstudy: yearstudy,
        gpa: gpa
      });
      setDkSuccess(response.data.message); 
      setName('');
      setEmailDk('');
      setPassDk('');
      setPassConfirm('');
      setPhone('');
      setSex('');
      setBirthday('');
      setJob('');
      setSpecialized('');
      setYearstudy('');
      setGpa('');
      console.log('Đăng ký thành công:', response.data);
    } catch (error) {
      setDkError(error.response?.data?.message || 'Đăng ký thất bại.');
    }
  }

  const handleDK = () => {
    setMove(!move);
    if (movementor){setMovementor(!movementor)}
  }
  const handleDKmentor = () => {
    setMovementor(!movementor);
    if (move){setMove(!move)}
  }
  
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (loginSuccess || loginError || dkSuccess || dkError) {
      setVisible(true);
      setHidden(false);

      const timer1 = setTimeout(() => setHidden(true), 1500);
      const timer2 = setTimeout(() => setVisible(false), 2000); 

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [loginSuccess, loginError, dkSuccess, dkError]);

  return (
    <div className="login">
      {visible && (
      <div className={`message-box ${hidden ? 'hidden' : ''}`}>
        {loginSuccess && <p style={{ color: 'green', fontWeight: 'bold' }}>{loginSuccess}</p>}
        {loginError && <p style={{ color: 'red', fontWeight: 'bold' }}>{loginError}</p>}
        {dkSuccess && <p style={{ color: 'green', fontWeight: 'bold' }}>{dkSuccess}</p>}
        {dkError && <p style={{ color: 'red', fontWeight: 'bold' }}>{dkError}</p>}
      </div>
      )}
      <div className={`square_login ${move ? 'move' : ''} ${movementor ? 'movementor' : ''}`}>
        <div className='logo_login'>
          <img src={logoimg} alt='' className='logo_Bk' />
          <h1 className='tutor_login'>TUTOR</h1>
        </div>
        <form onSubmit={handleSubmit_login}>
          <div className='email'>
            <img src={emailimg} alt='' className='email_img' />
            <input 
              type='email'
              placeholder='Nhập email...'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='email_input'
              required
            />
          </div>
          <div className='pass'>
            <img src={lock} alt='' className='pass_img' />
            <input 
              type='password'
              placeholder='Nhập mật khẩu...'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='pass_input'
              autoComplete="new-password" 
              required
            />
          </div>
          <button type='submit' className='login_buttom'>
            <h1 className='login_word'>Đăng nhập</h1>
          </button>
        </form>
        <div className='dk_dkmentor'>
          <button className='dk_buttom' onClick={handleDK}>
            <h1 className='dk_word'>Đăng ký Mentee</h1>
          </button>
          <button className='dkmentor_buttom' onClick={handleDKmentor}>
            <h1 className='dk_word'>Đăng ký Mentor</h1>
          </button>
        </div>
      </div>

      {/* ######################################################################## */}

        <div className={`square_dk ${move ? 'move' : ''}`} >
          <div className='logo_login'>
            <img src={logoimg} alt='' className='logo_Bk' />
            <h1 className='tutor_login'>TUTOR</h1>
          </div>
          <form onSubmit={handleSubmit_Dk}>
            <div className='name'>
              <img src={nameimg} alt='' className='name_img' />
              <input 
                type='text'
                placeholder='Nhập họ và tên...'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='name_input'
                required
              />
            </div>
            <div className='email_dk'>
              <img src={emailimg} alt='' className='email_img' />
              <input 
                type='email'
                placeholder='Nhập email...'
                value={email_dk}
                onChange={(e) => setEmailDk(e.target.value)}
                className='email_dk_input'
                required
              />
            </div>
            <div className='pass_dk'>
              <img src={lock} alt='' className='pass_img' />
              <input 
                type='password'
                placeholder='Nhập mật khẩu...'
                value={pass_dk}
                onChange={(e) => setPassDk(e.target.value)}
                className='pass_dk_input'
                autoComplete="new-password" 
                required
              />
            </div>
            <div className='pass_confirm'>
              <img src={lock} alt='' className='pass_img' />
              <input 
                type='password'
                placeholder='Nhập lại mật khẩu...'
                value={pass_confirm}
                onChange={(e) => setPassConfirm(e.target.value)}
                className='pass_confirm_input'
                required
              />
            </div>
            <div className='phone'>
              <img src={phoneimg} alt='' className='phone_img' />
              <input 
                type='tel'
                placeholder='Nhập số điện thoại...'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className='phone_input'
                required
              />
            </div>
            <div className='sex'>
              <img src={seximg} alt='' className='phone_img' />
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className='sex_input'
                required 
              >
                <option value=''>-- Giới tính --</option>
                <option value='M'>Nam</option>
                <option value='F'>Nữ</option>
              </select>
            </div>
            <div className='birthday'>
              <img src={yearimg} alt='' className='phone_img' />
              <input
                type='date'
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className='birthday_input'
                required
              />
            </div>
            {/* <div className='errorr'>
              {error && <p style={{ color: 'red', marginTop: '4px' }}>{error}</p>}
            </div> */}
            <button type='submit' className='dk_button'>
              <h1 className='dk_word'>Đăng ký</h1>
            </button>
          </form>
        </div>

        {/* ######################################################################## */}

        <div className={`square_dkmentors ${movementor ? 'movementor' : ''}`} >
          <div className='logo_login'>
            <img src={logoimg} alt='' className='logo_Bk' />
            <h1 className='tutor_login'>TUTOR</h1>
          </div>
          <form onSubmit={handleSubmit_Dkmentor}>
            <div className='name'>
              <img src={nameimg} alt='' className='name_img' />
              <input 
                type='text'
                placeholder='Nhập họ và tên...'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='name_input'
                required
              />
            </div>
            <div className='email_dk'>
              <img src={emailimg} alt='' className='email_img' />
              <input 
                type='email'
                placeholder='Nhập email...'
                value={email_dk}
                onChange={(e) => setEmailDk(e.target.value)}
                className='email_dk_input'
                required
              />
            </div>
            <div className='pass_dk'>
              <img src={lock} alt='' className='pass_img' />
              <input 
                type='password'
                placeholder='Nhập mật khẩu...'
                value={pass_dk}
                onChange={(e) => setPassDk(e.target.value)}
                className='pass_dk_input'
                autoComplete="new-password" 
                required
              />
            </div>
            <div className='pass_confirm'>
              <img src={lock} alt='' className='pass_img' />
              <input 
                type='password'
                placeholder='Nhập lại mật khẩu...'
                value={pass_confirm}
                onChange={(e) => setPassConfirm(e.target.value)}
                className='pass_confirm_input'
                required
              />
            </div>
            <div className='phone'>
              <img src={phoneimg} alt='' className='phone_img' />
              <input 
                type='tel'
                placeholder='Nhập số điện thoại...'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className='phone_input'
                required
              />
            </div>
            <div className='sex'>
              <img src={seximg} alt='' className='phone_img' />
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className='sex_input'
                required 
              >
                <option value=''>Giới tính</option>
                <option value='M'>Nam</option>
                <option value='F'>Nữ</option>
              </select>
            </div>
            <div className='birthday'>
              <img src={yearimg} alt='' className='phone_img' />
              <input
                type='date'
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className='birthday_input'
                required
              />
            </div>
            <div className='specialized'>
              <img src={facultyimg} alt='' className='phone_img' />
              <select
                value={specialized}
                onChange={(e) => setSpecialized(e.target.value)}
                className='specialized_input'
                required
              >
                <option value=''>Thuộc chuyên ngành</option>
                <option value='1'>Khoa học máy tính</option>
                <option value='2'>Kĩ thuật máy tính</option>
              </select>
            </div>
            <div className='job'>
              <img src={jobimg} alt='' className='phone_img' />
              <select
                value={job}
                onChange={(e) => setJob(e.target.value)}
                className='job_input'
                required
              >
                <option value=''>Chức danh</option>
                <option value='giang_vien'>Giảng viên</option>
                <option value='nghien_cuu_sinh'>Nghiên cứu sinh</option>
                <option value='sinh_vien'>Sinh viên</option>
                <option value='sinh_vien_sau_dh'>Sinh viên sau đại học</option>
              </select>
            </div>
            <div className='yearstudy'>
              <img src={yearstudyimg} alt='' className='phone_img' />
              <select
                value={yearstudy}
                onChange={(e) => setYearstudy(e.target.value)}
                className='yearstudy_input'
                required
              >
                <option value=''>Năm học (Null nếu không là sinh viên)</option>
                <option value='none'>Null</option>
                <option value='nam_2'>Năm 2</option>
                <option value='nam_3'>Năm 3</option>
                <option value='nam_4'>Năm 4</option>
              </select>
            </div>
            <div className='gpa'>
              <img src={gpaimg} alt='' className='phone_img' />
              <input 
                type='text'
                placeholder='Nhập Gpa... (để trống nếu không là sinh viên'
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                className='gpa_input'
              />
            </div>

            {/* <div className='errorr'>
              {error && <p style={{ color: 'red', marginTop: '4px' }}>{error}</p>}
            </div> */}
            <button type='submit' className='dk_button1'>
              <h1 className='dk_word'>Đăng ký</h1>
            </button>
          </form>
        </div>
    </div>
  );
}

export default Login