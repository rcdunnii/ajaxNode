
/*
 * Module dependencies.
 */

var express = require('express')
, swig = require('swig')
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, url  = require('url')
, path = require('path')
, cons = require('consolidate')
, mongo = require('mongodb')
, monk = require('monk')
, db = require('monk')('localhost:27017/walnuts')
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
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only

if ('development' == app.get('env')) {
  swig.setDefaults({ cache: false });
  app.use(express.errorHandler());
}

/*
app.configure('development', function(){
  app.use(express.errorHandler());
});
*/

app.get('/', routes.index);
app.get('/triage', routes.triage);
app.get('/enroll', routes.enrollNutForm);
app.get('/listNuts', routes.listNuts(db));
app.post('/insert', routes.insertNut(db));


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
