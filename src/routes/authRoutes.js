const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:authRoutes');

const authRouter = express.Router()

function router() {
    authRouter.route('/signUp')
        .post((req, res) => {
            const { username, password } = req.body;
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';

            (async function addUser() {
                let client;
                try {
                client = await MongoClient.connect(url);
                debug('Connected correctly to server');

                const db = client.db(dbName);

                const col = db.collection('user');
                const user = { username, password };
                const results = await col.insertOne(user);
                debug(results);
                // create user
                req.login(results.ops[0], () => {
                    res.redirect('/');
                });
                } catch (err) {
                debug(err);
                }
            }());
        }
    );
};

module.exports = router;
