var mongo = require('mongodb')
,    Server = mongo.Server
,    Db = mongo.Db
,    BSON = mongo.BSONPure    
    /* Enter the server connection parameters */
,    server = new Server('localhost', 27017, {auto_reconnect: true})
    /* Create a database 'nutMembers' in Mongo DB, before connecting */
,    db = new Db('nutMembers', server, {safe: true})
,    ourCollectionName = 'user';

/* Name your collection, use this variable instead of using collection name directly */
  
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to our mongo database");
        db.collection(ourCollectionName, {strict:true, safe:true}, function(errCol, collection) {
            if (errCol) {
                console.log("The "+ourCollectionName+" collection doesn't exist");
                createCollection();
            }
        });
    } else {
  	console.log("There is no "+ ourDatabaseName +" database in MongoDB. Please create this database Mongo and proceed... ");
    }
});

/*
*  Renders to entry page before login.
* */

exports.onEntry = function(req, res){
    console.log("In on entry...");
 /*   res.send("Some text");   */
    res.render('onEntry', { user: req.session.username, title: "Our Nuts Entry Screen" });
};

/*
*  Renders to login page, if no user is logged.
* */
exports.login = function(req, res){
    if (typeof req.session.username == 'undefined') {
        res.render('login', { user: req.session.username, loginErr: null, username: '' });
    }
    else res.redirect('/');
};

/*
*  Submit the username and password for authorization
* */
exports.loginSubmit = function(req, res){

    req.assert('username', "The username can't be empty!").notEmpty();
    req.assert('pwd', "The password can't be empty!").notEmpty().len(6,16);

    var errors = req.validationErrors();
    if (errors) {
        return res.render('login',
            { user: req.session.username, loginErr: errors[0].msg, username: req.body.username }
        );
    }

    db.collection(ourCollectionName, function(err, collection) {
        collection.findOne({'username':req.body.username, 'password':req.body.pwd}, function(err, result) {
            if (result) {
                req.session.username = result.username;
                res.render('home', { user: req.session.username, username: req.body.username });
            } else {
                res.render('login',
                    { user: req.session.username, loginErr: 'Username or password is wrong!', username: req.body.username }
                );
            }
        });
    });

};

/*
*  Renders to home page after login.
* */
exports.home = function(req, res){
    if (exports.isLoggedIn(req, res)) {
        return res.render('home',
            { user: req.session.username, username: req.session.username }
        );
    } else {
        return res.render('login', { user: req.session.username, loginErr: null, username: '' });
    }
};

/*
*  Renders to registration page.
* */
exports.registerView = function(req, res){
    if (typeof req.session.username != 'undefined') {
        res.render('home', { user: req.session.username, title: "Register User" });
    } else {
        res.render('register', {
            user: req.session.username,
            regErr: null,
            username: '',
            email: ''
        });
    }
};

/*
*  Submit the new user registration.
* */
exports.registerUser = function(req, res){

    req.assert('email', 'Please enter a valid email').len(6,64).isEmail();
    req.assert('username', "The username can't be empty!").notEmpty();
    req.assert('pwd', "The password can't be empty and 6 - 16 characters required").notEmpty().len(6,16);
    req.assert('confirmpwd', "The confirm password can't be empty").notEmpty();
    req.assert('pwd', 'Passwords do not match').equals(req.param('confirmpwd'));

    var errors = req.validationErrors();
    if (errors) {
        return res.render('register',
            { user: req.session.username,  username: req.body.username, regErr: errors[0].msg, email: req.body.email }
        );
    }

    db.collection(ourCollectionName, function (err, collection) {
        collection.findOne({'email':req.body.email}, function(err, result) {
            if (result) {
                return res.render('register',
                    { user: req.session.username,  username: req.body.username, regErr: 'This email is already taken!', email: req.body.email }
                );
            } else {
                collection.insert({
                    email:req.body.email,
                    username:req.body.username,
                    password:req.body.pwd,
                    created: Date.now()
                }, {safe:true}, function (err, result) {
                    if (result) {
                       req.session.username = req.body.username;                        
                       res.render('home',
                            { user:req.body.username, username:req.body.username, title: "Home Base" }
                           
                        );
                    }
                });
            }
        });
    });

};

/*
*  Renders to list of all users after login.
* */
exports.findAll = function(req, res) {
    if (!exports.isLoggedIn(req, res)) {
        return res.render('login', { user: req.session.username, loginErr: null, username: '' });
    }
    db.collection(ourCollectionName, function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.render('users', { items: items, user: req.session.username, username: req.body.username });
        });
    });
};

/*
*  Renders to edit page of user.
* */
exports.updateView = function(req, res) {
    var id = req.params.id;
    db.collection(ourCollectionName, {w:0}, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, result) {
            if (result) {
                res.render('update', { id: id, email: result.email, username: result.username });
            }
        });
    });
}

/*
*  Updating the user details.
* */
exports.updateUser = function(req, res) {

    var id   = req.params.id,
        user = req.body;

    req.assert('email', 'Please enter a valid email').len(6,64).isEmail();
    req.assert('username', "The username can't be null!").notEmpty();
    req.assert('pwd', "The password can't be empty and 6 - 16 characters required!").notEmpty().len(6,16);
    req.assert('confirmpwd', "The confirm password can't be empty!").notEmpty();
    req.assert('pwd', 'Passwords do not match').equals(req.param('confirmpwd'));

    var errors = req.validationErrors();
    if (errors) {
        return res.render('update',
            { id: id, email: user.email, username: user.username, err: errors[0].msg  }
        );
    }

    console.log('Updating user: ' + id);
    console.log(JSON.stringify(user));
    db.collection(ourCollectionName, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, { email: user.email, username: user.username, password: user.pwd  }, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating user: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.render('update', {id: id, email: user.email, username: user.username, success: true, disable: true});
            }
        });
    });
}

/*
*  Delete the user.
* */
exports.deleteUser = function(req, res) {
    var id = req.params.id;
    console.log('Deleting user: ' + id);
        db.collection(ourCollectionName, function(err, collection) {
            collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
                if (err) {
                    res.send({'error':'An error has occurred - ' + err});
                } else {
                    exports.findAll(req, res);
                }
            });
        });
}

/*
*  Remove all documents in your collection.
*  The url '/remove' will be used.
* */
exports.removeAllUser = function(req, res) {
    db.collection(ourCollectionName, {w:0}, function(err, collection) {
        collection.remove();
    });
    res.redirect('back');
}

/*
*  Drop your collection.
*  The url '/drop' will be used.
* */
exports.dropCol = function(req, res) {
    db.collection(ourCollectionName, {w:0}, function(err, collection) {
        collection.drop();
    });
    res.redirect('back');
}

/*
*  Check the user is logged or not.
* */
exports.isLoggedIn = function(req, res) {
    if (typeof req.session.username !== 'undefined') {
        return true;
    }
    return false;
}

/*
*  Logout current user and clear session
* */
exports.logout = function(req, res){
    req.session.destroy();
    res.redirect('/');
};

/*
*  Create a collection for database
* */
var createCollection = function() {
    db.createCollection("user", function(err, collection){
    });
    /* Insert some sample data to database */
    insertUserData();
}
var insertUserData = function() {

    var users = [
        {
            email: "stub@stub.xxx",
            username: "stubby",
            password: "stub123",
            created: Date.now()
        },
        {
            email: "justin@xxxx.xx",
            username: "justin",
            password: "justin123",
            created: Date.now()
        },
        {
            email: "rose@xxxx.xx",
            username: "rose",
            password: "rose123",
            created: Date.now()
        },
        {
            email: "bibbin@xxxx.xx",
            username: "bibbin",
            password: "bibbin123",
            created: Date.now()
        }
    ];

    db.collection(ourCollectionName, function(err, collection) {
        collection.insert(users, {safe:true}, function(err, result) {
            console.log(result);
            if (result) console.log("Sucessfully inserted sample data to your collection");
        });
    });

};
