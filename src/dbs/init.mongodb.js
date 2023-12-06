'use strict'

const mongoose = require('mongoose');
const {db: {host, port, name}} = require('../configs/config.mongodb');
const {countConnections} = require('../helpers/check.connect');

const connectString = `mongodb://${host}:${port}/${name}`;
console.log(connectString);

class Database {
    constructor() {
        this.connect();
    }

    // connect
    connect( type = 'mongodb' ) {
        if(1 === 1){
            mongoose.set('debug', true);
            mongoose.set('debug', {color: true});
        }

        mongoose.connect(connectString, {
            maxPoolSize: 50
        })
        .then( _  => {
            countConnections();
            console.log(`Connected to MongoDb Success`)
        })
        .catch(err => {console.log(`Error Connecting to MongoDB!`)})
    }

    static getInstance() {
        if(!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;