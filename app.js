const express = require('express');
const debug = require('debug')('app');
const morgan = require('morgan');
const chalk = require('chalk');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport')
const cookieParser = require('cookie-parser');
const session = require('express-session')
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'library'}))

require('./src/config/passport.js')(app)

app.use(express.static(path.join(__dirname, '/public')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/popper.js/dist/umd')));
app.set('views', './src/views');
app.set('view engine', 'ejs');

const bookRouter = require('./src/routes/bookRoutes');

const bookService = require('./src/services/goodreadsService')
// app.use('/books', bookRouter);

app.get('/', (req, res) => {
    res.render(
        'index',
        {
            auth: req.user
        }
    );
});

app.get('/logOut', (req, res) => {
    req.logout()
    res.redirect('/')
})

app.get('/books', (req, res) => {
    res.render(
        'bookListView',
    )
});

app.get('/profile', (req, res) => {
    res.render('profile')
});

app.post('/signIn', 
    passport.authenticate('local', {
        failureRedirect: '/'
    }),
    function(req, res) {
        res.redirect('/profile')    
    }
);

app.post('/register', (req, res) => {
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
          res.redirect('/profile');
        });
      } catch (err) {
        debug(err);
      }
    }());
})

app.post('/books', (req, res) => {
    (async function gr(){
        try {
            let bookList = await bookService.getBookByQuery(req.body.bookQuery);
            // var bookArr;
            // for (var i = 0; i < bookList.length; ++i) {
            //     bookArr.push({rating: bookList.work[i].average_rating, list: bookList.work[i].best_book});
            // }   
            // res.send(bookArr);
            res.render(
                'bookListView',
                {
                    list: bookList.work,
                    title: 'Library'
                }
            );
        } catch (err) {
            debug(err)
        }
    }());
});

app.get('/books/:id', (req, res) => {
    (async function book(){
        try {
            let book = await bookService.getBookById(req.params.id);
            res.render('bookView',
                {
                    book: book
                }
            );
        } catch (err) {
            debug(err)
        }
    }());
});



app.listen(port, () => {
    debug(`Listening on port ${chalk.green(port)}`);
});
