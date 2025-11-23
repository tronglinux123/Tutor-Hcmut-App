require('dotenv').config();
require('./db');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT||5000;
const authRouters = require('./auth.routes');
const browseRouters = require('./browse.routes');
const mentorRouters = require('./mentor.routes');
const menteeRouters = require('./mentee.routes');


app.use(cors());
app.use(express.json());
app.use('/api', authRouters)
app.use('/api', browseRouters)
app.use('/api', mentorRouters)
app.use('/api', menteeRouters)

app.get('/',(req, res) => {
    res.send('Sever is running');
})

app.listen(PORT, () =>{
    console.log(`Backend run at http://localhost:${PORT}`);
});