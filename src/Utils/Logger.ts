export namespace Utils {

    interface LoggerStyleConf {
        LOG_STYLE?: string,
        LOG_WARNING_STYLE?: string,
        LOG_ERROR_STYLE?: string,
        PREFIX?: boolean,
        LOG_PREFIX?: string,
        LOG_WARNING_PREFIX?: string,
        LOG_ERROR_PREFIX?: string
    }

    enum LOG_TYPE {
        LOG,
        LOG_WARNING,
        LOG_ERROR
    }

    export class Logger {
        private static LOG: boolean = false;

        private static style: LoggerStyleConf = {
            LOG_STYLE: '\x1b[37m%s\x1b[0m',
            LOG_WARNING_STYLE: '\x1b[36m%s\x1b[0m',
            LOG_ERROR_STYLE: '\x1b[31m%s\x1b[0m',
            PREFIX: true,
            LOG_PREFIX: "< LOG >             :",
            LOG_WARNING_PREFIX: "< LOG WARNING >     :",
            LOG_ERROR_PREFIX: "[ LOG ERROR ]       :"
        };

        public static Log(message?: any, ...optionalParams: any[]): void {
            this.Brain(LOG_TYPE.LOG);
            if (this.LOG) {
                const prefix = this.style.PREFIX ? this.style.LOG_PREFIX : '';
                console.log(this.style.LOG_STYLE, `${prefix} ${message}`, ...optionalParams);
            }
        }

        public static LogWarning(message?: any, ...optionalParams: any[]): void {
            this.Brain(LOG_TYPE.LOG_WARNING);
            if (this.LOG) {
                const prefix = this.style.PREFIX ? this.style.LOG_WARNING_PREFIX : '';
                console.warn(this.style.LOG_WARNING_STYLE, `${prefix} ${message}`, ...optionalParams);
            }
        }

        public static LogError(message?: any, ...optionalParams: any[]): void {
            this.Brain(LOG_TYPE.LOG_ERROR);
            if (this.LOG) {
                const prefix = this.style.PREFIX ? this.style.LOG_ERROR_PREFIX : '';
                console.error(this.style.LOG_ERROR_STYLE, `${prefix} ${message}`, ...optionalParams);
            }
        }

        public static ChangeStyle(style: LoggerStyleConf): void {
            this.style = style;
        }

        private static Constraint(): void {
            this.LOG = process.env.LOG === "true" ? true : false;
        }

        private static Brain(logType: LOG_TYPE): string {
            this.Constraint();
            let prefix = '';
            if (!this.style.PREFIX)
                return prefix;

            switch (logType) {
                case LOG_TYPE.LOG:
                    prefix = this.style.LOG_PREFIX || '';
                    break;
                case LOG_TYPE.LOG_WARNING:
                    prefix = this.style.LOG_WARNING_PREFIX || '';
                    break;
                case LOG_TYPE.LOG_ERROR:
                    prefix = this.style.LOG_ERROR_PREFIX || '';
                    break;
            }
            return prefix;
        }
    }

}
