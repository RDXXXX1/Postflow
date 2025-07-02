const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    'POSTFLOW',
    'root',
    'rdmishra', {
        host: 'localhost',
        dialect: 'mysql',
        logging: console.log,
    }
);

async function connectDb() {
    try {
        await sequelize.authenticate()
            .then(() => console.log("Connected to DB Mr. RD Mishra"))
            .catch(err => console.error('There is a database error', err));
            await sequelize.sync();
    } catch (err) {
        console.log('There is an error in connection', err);
    }
}

module.exports = { sequelize, connectDb };
