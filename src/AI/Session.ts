import OpenAI from "openai";

export class Session {
    private openAI!: OpenAI;
    private api_key: string;
    private events = {
        onSessionCreatedSuccess: (session: Session) => { },
        onSessionCreatedFailed: (error: Error) => { }
    };

    constructor(APIKEY: string) {
        this.api_key = APIKEY;
        if (this.ValidateApiKey(APIKEY)) {
            this.Create().then((session: Session) => {
                this.events.onSessionCreatedSuccess(session);
            }).catch((error: Error) => {
                this.events.onSessionCreatedFailed(error);
            });
        } else {
            this.events.onSessionCreatedFailed(new Error("API Key Validation Error!"));
        }
    }

    private async Create(): Promise<Session> {
        try {
            if (!this.openAI) {
                this.openAI = new OpenAI({ apiKey: this.api_key });
                return this;
            } else {
                throw new Error("AI Already Created!");
            }
        } catch (e: any) {
            throw e;
        }
    }

    private ValidateApiKey(APIKEY: string): boolean {
        const apiKeyPattern = /^sk-[a-zA-Z0-9-_]{48,}$/;
        return apiKeyPattern.test(APIKEY);
    }

    public BindEvents(onSessionCreatedSuccess: (session: Session) => {}, onSessionCreatedFailed: (error: Error) => {}): void {
        this.events.onSessionCreatedSuccess = onSessionCreatedSuccess;
        this.events.onSessionCreatedFailed = onSessionCreatedFailed;
    }

    public async Message(message: string): Promise<any> {
        if (this.openAI !== null) {
            try {
                const completion = await this.openAI.chat.completions.create({
                    model: "gpt-4o-mini",
                    store: true,
                    messages: [
                        { role: "user", content: message },
                    ]
                });
                return completion;
            } catch (e: any) {
                throw e;
            }
        } else {
            throw new Error("AI Session End, Create new session!");
        }
    }
}
