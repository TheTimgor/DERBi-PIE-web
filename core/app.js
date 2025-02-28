const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// routers
const indexRouter = require('./routes');
const dictionaryRouter = require('./routes/dictionary');
const searchRoutes = require('./routes/search');
const constructionRoutes = require('./routes/construction');
const {downloadRouter} = require('./routes/download');
const {resultsRoutes} = require('./routes/results');
const instructionsRouter = express.Router().get('/', (req, res) => {res.render('instructions.pug')});
const aboutRoutes = express.Router().get('/', (req, res) => {res.render('about')});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/dictionary', dictionaryRouter);
app.use('/search', constructionRoutes);
app.use('/searchProper', searchRoutes);

app.use('/results', resultsRoutes);
app.use('/about', aboutRoutes);
app.use('/instructions', instructionsRouter);
app.use('/download', downloadRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// initialize plugins
const loadPlugins = require('./pluginLoader');
const PluginInterface = require('./pluginInterface');
const plugins = loadPlugins(PluginInterface);

module.exports = app;
