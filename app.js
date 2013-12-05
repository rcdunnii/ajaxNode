
/*
 * Module dependencies.
 */

var express = require('express')
, swig = require('swig')
, routes = require('./routes')
, user = require('./routes/user')
, expressValidator = require('express-validator')
, http = require('http')
, url  = require('url')
, path = require('path')
, cons = require('consolidate')
, mongo = require('mongodb')
, monk = require('monk')
, db1 = require('monk')('localhost:27017/walnuts')
, VIEWS_DIR = __dirname + '/views';
  
var app = express();

// all environments

app.set('port', process.env.PORT || 3000);
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', VIEWS_DIR);

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser()); // parse body of post message
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(expressValidator());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only

if ('development' == app.get('env')) {
  swig.setDefaults({ cache: false });
  app.use(express.errorHandler());
}

app.get('/', user.onEntry);
app.get('/home', user.home);
app.get('/login', user.login);
app.post('/login', user.loginSubmit);
app.get('/logout', user.logout);
app.get('/users', user.findAll);
app.get('/register', user.registerView);
app.post('/register', user.registerUser);
app.get('/users/:id', user.updateView);
app.post('/users/:id', user.updateUser);
app.get('/delete/:id', user.deleteUser);
app.get('/search', routes.searchNuts(db1));
app.get('/triage', routes.triage);
app.get('/enroll', routes.enrollNut);
app.get('/listNuts', routes.listNuts(db1));
app.get('/delete', routes.deleteNut(mongo,db1));
app.get('/edit', routes.editNut(mongo, db1));


app.post('/insert', routes.insertNut(db1));
app.post('/update', routes.updateNut(mongo,db1));


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
