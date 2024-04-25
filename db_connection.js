const{Client} = require("pg");
const client = new Client({
    host: 'localhost',
    port: '5432',
    database: 'steam_data',
    user: 'postgres',
    password: 'password', 
});