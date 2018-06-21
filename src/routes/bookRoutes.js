const express = require('express');
const debug = require('debug')('app:bookRoutes');

const bookRouter = express.Router();

function router() {
    bookRouter.route('/')
    .get(function (req, res) {
      res.render('bookListView');
      next();
    })
    bookRouter.route('/search')
    .post(function (req, res) {
      debug(req.body.bookQuery);
      res.send(req.body.bookQuery);
    });
  return bookRouter;
}

module.exports = router;
