import path from 'path';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const app = express()
const port = 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("/uploads"));

// multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
})

const upload = multer({storage:storage});

// utils
const sendResponse = (res, meta={status: 200, message: 'success'}) => {
    res.send({
        status: meta?.status,
        message: meta?.message,
        data: meta?.data
    })
}

// routes
app.post('/upload',upload.single("file"), (req,res) => {

    console.log(req?.file);
    sendResponse(res,{message: 'File uploaded successfully'});
})

// global route
app.get('/', (req, res) => {
  sendResponse(res,{message:"Hello world!"})
})

// app
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
