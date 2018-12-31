import winston from 'winston';
import { format } from 'logform';

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: format.simple()
});

export default logger;
