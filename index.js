import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';

const app = express()
const port = 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"))



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

const upload = multer({ storage: storage });

// utils
const sendResponse = (res, meta = { status: 200, message: 'success' }) => {
    res.send({
        status: meta?.status,
        message: meta?.message,
        data: meta?.data
    })
}

// routes
app.post('/upload', upload.single("file"), (req, res) => {

    try {
        console.log(req?.file);
        const videoId = uuidv4();
        const videoPath = req?.file?.path;
        const outputPath = `./uploads/serve/${videoId}`;

        const hlsPath = `${outputPath}/index.m3u8`; // HTTP Live Streaming

        console.log(hlsPath);

        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        // ffmpeg - proof of concept 
        const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

        exec(ffmpegCommand, (error, stdout, stderr) => {

            fs.unlink(videoPath, (err) => {
                if (err) console.error('Error deleting original file:', err);
            });

            if (error) {
                console.log(`esec error: ${error}`);
                return sendResponse(res, {
                    status: 500,
                    message: 'Video conversion failed',
                    data: { error: error.message }
                });
            }
            console.log(`stdout error: ${stdout}`);
            console.log(`stderr error: ${stderr}`);
        })

        const videoUrl = `http://localhost:5000/uploads/serve/${videoId}/index.m3u8`;


        sendResponse(res, { message: 'File uploaded successfully', data: { video: videoUrl } });

    } catch (err) {
        console.error('Upload error:', err);
        sendResponse(res, {
            status: 500,
            message: 'Internal server error',
            data: { error: err.message }
        });
    }
})

// global route
app.get('/', (req, res) => {
    sendResponse(res, { message: "Hello world!" })
})

// app
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
