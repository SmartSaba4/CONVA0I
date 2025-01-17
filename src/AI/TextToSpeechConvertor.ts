import { ElevenLabsClient } from 'elevenlabs';
import { createWriteStream, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';
import path from 'path';

export class TextToSpeechConvertor {
    private APIKEY: string;
    private client: ElevenLabsClient;
    public storagePath: string = '';

    constructor(_apiKey: string) {
        this.APIKEY = _apiKey;
        this.storagePath = path.join(process.cwd(), 'storage', 'text-to-speech');
        this.client = new ElevenLabsClient({
            apiKey: this.APIKEY
        });
    }

    public GetClient(_apiKey: string): ElevenLabsClient {
        if (_apiKey === this.APIKEY) {
            return this.client;
        }
        throw new Error("Invalid API Key");
    }

    public async Convert(text: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const audio = await this.client.generate({
                    voice: "Rachel",
                    model_id: "eleven_turbo_v2_5",
                    text,
                });

                mkdirSync(this.storagePath, { recursive: true });

                const fileName = `${uuid()}.mp3`;
                const filePath = path.join(this.storagePath, fileName);
                const fileStream = createWriteStream(filePath);

                audio.pipe(fileStream);
                fileStream.on("finish", () => resolve(filePath));
                fileStream.on("error", reject);
            } catch (error) {
                reject(error);
            }
        });
    }
}

