import { createLogger, format, transports } from 'winston';

const customFormat = format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

export const logger = createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), customFormat),
    transports: [
        new transports.Console({ level: 'info' }),
        new transports.File({
            filename: './log/media-utils.log',
            level: 'info',
        }),
    ],
});
