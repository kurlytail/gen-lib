import Generator from './generator';
import logger from './logger';

const generator = new Generator();
generator
    .generate()
    .catch(err => {
        logger.error(err);
        return generator.cleanupOnError();
    })
    .then(() => {
        logger.info('sgen is done');
    });
