
 /*
  * GET home page.
  */

 exports.index = function(req, res){
   res.render('index',{ title: 'Welcome, Nut' });
 };

 exports.triage = function(req, res) {       
        if (req.param('list')) {
            res.redirect("listNuts");
            res.location("listNuts"); // set header of form
        } else if (req.param('add')) {   
            res.redirect("enroll");
            res.location("enroll"); // set form header
        } else {
            res.end("Must make choice!");
        }
};

    
 exports.enrollNutForm = function(req, res) {
   res.render('enrollNutForm', {title: "Add New Nut"});
 };
 
 exports.insertNut = function(db) {
    return function(req, res) {
        // Get our form values. These rely on the "name" attributes
        var sirName = req.body.sirName
        , firstName = req.body.firstName
        , lastName = req.body.lastName
        , email1 = req.body.email1
        , email2 = req.body.email2
        , phone1 = req.body.phone1
        , phone2 = req.body.phone2;
         // Set our collection
        var collection = db.get('nuts');
        collection.insert({
            "sirName" : sirName,
            "firstName" : firstName,
            "lastName" : lastName,
            "email1": email1,
            "email2": email2,
            "phone1": phone1,
            "phone2": phone2
        }, function(err, doc) {
            if (err) {
                res.send("Couldn't add nut to db");
            }else {
                // If it worked, forward to success page
                res.redirect("listNuts");
                // And set the header so the address bar doesn't still say /adduser
                res.location("listNuts");
            }
         });
     }
}     

 exports.listNuts = function(db) {
     return function(req, res) {
         var collection = db.get('nuts');
         collection.find({},{},function(e,docs){
            if (e) throw error;
             res.render('listNuts', {"nutCollection" : docs, "listTitle": "Our Nuts"});
         });
     }
 }
 
/*
exports.adduser = function(db) {
    return function(req, res) {

        // Get our form values. These rely on the "name" attributes
        var userName = req.body.username;
        var userEmail = req.body.useremail;

        // Set our collection
        var collection = db.get('nuts');

        // Submit to the DB
        collection.insert({
            "username" : userName,
            "email" : userEmail
        }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // If it worked, forward to success page
                res.redirect("userlist");
                // And set the header so the address bar doesn't still say /adduser
                res.location("userlist");
            }
        });

    }
}
*/