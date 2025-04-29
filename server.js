require('dotenv').config();
const app = require('./src/app');
const { getConnection } = require('./src/dbConfig/dbCon');

const PORT = process.env.PORT || 3000;

getConnection().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Could not start server:', err);
});