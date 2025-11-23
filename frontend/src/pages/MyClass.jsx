import './MyClass.css';
const BACKEND_URL = 'http://localhost:5000';
import { useEffect } from 'react';
import { useState } from 'react';
import trashimg from '../image/trash.png';
import axios from 'axios';

function MyClass() {
    const [tutorPair, settutorPair] = useState('');
    const [newSub, setNewSub] = useState('');
    const [outline, setoutline] = useState([]);
    const [loading1, setLoading1] = useState(true); 
    const [loading2, setLoading2] = useState(true); 
    const [move, setMove] = useState(false);
    const [moveon, setMoveon] = useState(false);
    const pairID = localStorage.getItem('PairID');
    const [value, setValue] = useState('');
    const [title, setTitle] = useState('');
    const [outlineId, setOutlineId] = useState('');
    const [browseError, setBrowseError] = useState('');
    const [browseSuccess, setBrowseSuccess] = useState('');
    const loadTutorPairpairID = async (e) => {
        setLoading1(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/api/loadTutorPairpairID`,{
                pairID: pairID
            });
            // console.log(response.data.user);
            settutorPair(response.data.user);
        } catch (error) {
            console.log('err fonr', error);
        } finally {
            setLoading1(false);
        }
    }
    const loadOutline = async (e) => {
        setLoading2(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/api/loadOutline`,{
                pairID: pairID
            });
            // console.log(response.data.user);
            setoutline(response.data.user);
        } catch (error) {
            console.log('err fonr', error);
        } finally {
            setLoading2(false);
        }
    }
    useEffect(() => {
        loadTutorPairpairID();
        loadOutline();
        console.log('ok')
    },[])
    const handleSeeoutline = (Outline) => {
        // console.log(Outline)Name
        setMove(true);
        setValue(Outline.Context);
        setOutlineId(Outline.OutlineID);
        setTitle(Outline.Name);
    }
    const handleFocus = (e) => {
    };
    const handleChange = (e) => {
        setValue(e.target.value);
    };
    const handleChangeTitle = (e) => {
        setTitle(e.target.value);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(value);
        setBrowseError('');
        setBrowseSuccess('');
        try {
            const response = await axios.post(`${BACKEND_URL}/api/submitOutline`,{
                OutlineID: outlineId,
                Context: value,
                Name: title
            });
            setBrowseSuccess(response.data.message);
            loadOutline()
        } catch (error) {
            console.log('err fonr', error);
        }
    }
    const handleOut = () =>{
        setMove(false);
    }
    const handleAddsubject = () => {
        setMoveon(!moveon);
        setNewSub('');
    }
    const handleSubmitSubject = async (e) => {
        setBrowseError('');
        setBrowseSuccess('');
        // console.log(newSub);
        e.preventDefault();
        try {
            const response = await axios.post(`${BACKEND_URL}/api/submitNewSubject`,{
                Name: newSub,
                PairID: pairID
            });
            console.log(response.data.user);
            setBrowseSuccess(response.data.message);
            setMoveon(false);
            loadOutline()
        } catch (error) {
            setBrowseError(error.response?.data?.message || 'Lỗi hệ thống khi cập nhật trạng thái');
        }
    }
    const handleDeleOutline = async (OutlineID) => {
        setBrowseError('');
        setBrowseSuccess('');
        try {
            const response = await axios.post(`${BACKEND_URL}/api/handleDeleOutline`,{
                OutlineID: OutlineID
            });
            console.log(response.data.user);
            setBrowseSuccess(response.data.message);
            loadOutline();
        } catch (error) {
            setBrowseError(error.response?.data?.message || 'Lỗi hệ thống khi cập nhật trạng thái');
        }
    }
    const [visible, setVisible] = useState(false);
    const [hidden, setHidden] = useState(false);
    
    useEffect(() => {
        if (browseError || browseSuccess) {
        setVisible(true);
        setHidden(false);

        const timer1 = setTimeout(() => setHidden(true), 2500);
        const timer2 = setTimeout(() => setVisible(false), 3000); 

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
        }
    }, [browseError, browseSuccess]);
    if (loading1 || loading2) { return <p>Loading...</p>; }
    return (
        <div className={`MyClass ${move ? 'move' : ''}`}>
            {visible && (
                <div className={`message-box ${hidden ? 'hidden' : ''}`}>
                    {browseSuccess && <p style={{ color: 'green', fontWeight: 'bold' }}>{browseSuccess}</p>}
                    {browseError && <p style={{ color: 'red', fontWeight: 'bold' }}>{browseError}</p>}
                </div>
                )}
            <div className='outlinetren'>
                <strong className='outlinea'>{`${tutorPair[0].Subject_name} (CN${tutorPair[0].pairID})`}</strong>
            </div>
            <div className='boxoutline'>
                <div className='titleoutline'>
                    <div className='hinhtron'></div>
                    <strong>Nội dung bài học</strong>
                </div>
                <div className='lineoutline'></div>
                {outline.map((Outline) => (
                    <div className='outhigh' key={Outline.OutlineID}>
                        <div className='circl-blue'></div>
                        <strong onClick={() => handleSeeoutline(Outline)} className='outlinename'>{Outline.Name}</strong>
                        <img src={trashimg} onClick={() => handleDeleOutline(Outline.OutlineID)} alt='' className='trashs' />
                    </div>
                ))}
            </div>
            <div className='add' onClick={handleAddsubject}><strong>+</strong></div>
            
            <div className={`addsubject ${moveon ? 'moveon' : ''}`}>
                
                <form className={`addsubject ${moveon ? 'moveon' : ''}`} onSubmit={handleSubmitSubject}>
                    {moveon && (
                        <button type='button' onClick={handleAddsubject} className={`cancelsub ${moveon ? 'moveon' : ''}`}><strong>Thoát</strong></button>
                    )}
                    {moveon && (
                        <input 
                            type='text'
                            value={newSub}
                            onChange={(e) => setNewSub(e.target.value)}
                            className='newSub_input'
                            required
                        />
                    )}
                    {moveon && (
                        <button type='submit' className={`oksubject ${moveon ? 'moveon' : ''}`}><strong>Lưu</strong></button>
                    )}
                </form>
            </div>
            <div className={`outlinetext ${move ? 'move' : ''}`}>
                {move === true && (
                    <form className={`outlinetext ${move ? 'move' : ''}`} onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={title}
                            onFocus={handleFocus}
                            onChange={handleChangeTitle}
                            className="hinttitle"
                            required
                        />
                        <textarea
                            value={value}
                            onFocus={handleFocus}
                            onChange={handleChange}
                            className="hint"
                            rows={3}  
                        ></textarea>
                        <div className='buttoninoutline'>
                            <button type="button" className="outoutline" onClick={handleOut}>
                                <strong>Thoát</strong>
                            </button>
                            <button type="submit" className="submitoutline">
                                <strong>Lưu</strong>
                            </button>
                            
                        </div>
                    </form>
                )}
            </div>
            {/* <div className={`overlay ${move ? 'move' : ''}`}>
            </div> */}
        </div>
    );
    
    
}

export default MyClass