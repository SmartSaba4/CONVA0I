import { AssemblyAI, Transcript } from 'assemblyai'

export class SpeechToTextConvertor {
    private APIKEY: string = '';
    private client!: AssemblyAI;
    private config = {
        audio_url: ''
    }
    constructor(_apiKey: string) {
        this.APIKEY = _apiKey;
        this.client = new AssemblyAI({
            apiKey: this.APIKEY
        });
    }

    public GetClient(_apiKey: string): AssemblyAI {
        let _client!: AssemblyAI;
        if (_apiKey === this.APIKEY) {
            _client = this.client
        }
        return _client;
    }

    public async Convert(_audioUrl: string): Promise<Transcript> {
        this.config.audio_url = _audioUrl;
        const transcript = await this.client.transcripts.transcribe(this.config);
        if (!transcript)
            throw new Error("Audio conversion failed !");
        return transcript;
    }
}
