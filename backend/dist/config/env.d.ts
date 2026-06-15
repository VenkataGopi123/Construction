export declare const env: {
    readonly nodeEnv: string;
    readonly port: number;
    readonly isProduction: boolean;
    readonly database: {
        readonly url: string | undefined;
        readonly host: string;
        readonly port: number;
        readonly name: string;
        readonly user: string;
        readonly password: string;
    };
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
        readonly refreshExpiresIn: string;
    };
    readonly google: {
        readonly clientId: string;
        readonly clientSecret: string;
        readonly callbackUrl: string;
    };
    readonly frontendUrl: string;
    readonly openai: {
        readonly apiKey: string;
    };
    readonly gemini: {
        readonly apiKey: string;
    };
    readonly smtp: {
        readonly host: string;
        readonly port: number;
        readonly user: string;
        readonly pass: string;
        readonly from: string;
    };
    readonly twilio: {
        readonly accountSid: string;
        readonly authToken: string;
        readonly phoneNumber: string;
        readonly whatsappFrom: string;
    };
    readonly aws: {
        readonly region: string;
        readonly accessKeyId: string;
        readonly secretAccessKey: string;
        readonly s3Bucket: string;
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly max: number;
    };
    readonly upload: {
        readonly maxFileSize: number;
        readonly uploadDir: string;
    };
};
//# sourceMappingURL=env.d.ts.map