import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { Session } from './AI/Session';
import { SpeechToTextConvertor } from './AI/SpeechToTextConvertor';
import bodyParser from 'body-parser';
import { TextToSpeechConvertor } from './AI/TextToSpeechConvertor';
import { Utils } from './Utils/Logger';


////////////// KEYS ////////////////////////////////////////////////
dotenv.config();
const port = process.env.PORT || 3001;
const openAI_API_KEY = process.env.OPENAI_API_KEY || '';
const AssemblyAI_API_KEY = process.env.ASSEMBLY_AI_API_KEY || '';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const STATIC_STORAGE_PATH = path.join(process.cwd(), 'storage')


////////////// APPS ////////////////////////////////////////////////
const app = express();
const session = new Session(openAI_API_KEY);
const convertor = new SpeechToTextConvertor(AssemblyAI_API_KEY);
const text_to_speech_converter = new TextToSpeechConvertor(ELEVENLABS_API_KEY);
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'storage', 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });


////////////// MIDDLEWARES ////////////////////////////////////////////////
app.use('/storage', express.static(STATIC_STORAGE_PATH));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


////////////// APIS ////////////////////////////////////////////////
app.get('/', (req: Request, res: Response) => {
    session.Message("What is Hello World!").then((result: any) => {
        res.send(result.choices[0].message.content);
    }).catch((e: Error) => {
        res.send(e.message);
    });
});

app.post('/audio-to-text', upload.single('audio'), async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
    }
    try {
        // const filePath = path.join(__dirname, 'uploads', req.file!.filePath);
        const fileURL = `${STATIC_STORAGE_PATH}/uploads/${req.file?.filename}`;
        convertor.Convert(fileURL).then((transcript: any) => {
            res.status(200).send(transcript);
        }).catch((e: Error) => {
            res.status(500).send(e.message);
        });
    } catch (error: any) {
        Utils.Logger.LogError('Error processing audio file:', error.message);
        res.status(500).send(`Error processing audio file: ${error.message}`);
    }
});

app.post('/que-ai', (req: Request, res: Response) => {
    let message: string = req.body.message;
    Utils.Logger.Log(message.length)

    if (!message || message.length >= 30)
        res.status(400).send('Empty text or Text limit Exceed.')
    session.Message(message).then((result: any) => {
        res.status(200).send(result.choices[0].message.content);
    }).catch((e: Error) => {
        res.status(500).send(e.message);
    });
})

app.post('/text-to-speech', (req: Request, res: Response) => {
    let message: string = req.body.message;
    Utils.Logger.Log(message.length)

    if (!message) {
        res.status(400).send('Empty text not allowed.');
    }

    text_to_speech_converter.Convert(message).then((filePath: string) => {
        const fileName = path.basename(filePath);
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.status(200).sendFile(filePath);
    }).catch((e: Error) => {
        res.status(500).send(e.message);
    });
});

app.post('/text-to-reply-speech', (req: Request, res: Response) => {
    let message: string = req.body.message;
    Utils.Logger.Log(message.length);

    if (!message || message.length >= 30)
        res.status(400).send('Empty text or Text limit Exceed.')
    session.Message(message).then((result: any) => {
        text_to_speech_converter.Convert(result.choices[0].message.content).then((filePath: string) => {
            const fileName = path.basename(filePath);
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.status(200).sendFile(filePath);
        })
    }).catch((e: Error) => {
        res.status(500).send(e.message);
    });
})


////////////// HOST ////////////////////////////////////////////////
app.listen(port, () => {
    Utils.Logger.LogWarning(`Server is running at http://localhost:${port}`);
});