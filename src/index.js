import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/connection.js';
const localPort = 5000;

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        app.listen(process.env.PORT || localPort, () => {
            console.log(`Server is Running at PORT : ${process.env.PORT}`)
        })
    }).catch((err) => {
        console.log(err);
    })