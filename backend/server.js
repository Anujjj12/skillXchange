const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("Database Connected"))
.catch((err) => console.log(err));

app.get('/', (req, res) => {
    res.send("App is Running...")
})

const port = 5000;

app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
})
