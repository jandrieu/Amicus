
module.exports = function( config, mongoose, nodemailer) { 
    // config should contain {salt:"somesalt"} for an app-specific addition to the salt

    var crypto = require(' crypto');

    // currently we only support native auth_type. we'll simply add new keys
    // for different auth_types (such as facebook or OneID)
    
    var AuthSchema = new mongoose.Schema({
	auth_type: { type:String },
	username: {type:String, required: false},
	pw_hash: {type:String, required: false},
	pw_salt: {type:String, required: false}
    });
    
    var AccountSchema = new mongoose.Schema({ 
	handle: { type: String },
	emails: [{ type: String }],
	auths: [{ type: AuthSchema}]//, 
	//endpoints: [{ type: String, unique: true, required: false}]
	// endpoints are for uniquely identifying accounts for incoming services (like messages)
    }); 
    
    var Account = mongoose.model('Account', AccountSchema);
    
    // construct our hashed password, using the app_salt and pw_salt
    // app_salt should be kept out of the database, a warning is generated
    //   if it is missing
    // pw_salt should be specific to each user. if it is missing, we'll 
    //   generate one and return it. Keep it in the db once we create it. 
    
    var makeHash(password, pw_salt) {
	
	var shaSum = crypto.createHash('sha256'); 
	
	// set up the salt, keeping the random bit so we can store it in the db
	var raw_salt = pw.salt ? pw_salt : Math.floor(new Date().getTime() * Math.random());
	var salt = raw_salt;
	
	// add the app-specific salt so that just getting the db isn't quite enough
	if(config.salt) 
	    salt += config.salt;
	else
            console.log("Warning: missing config.salt (in Account.js:makeHash)");
	
	shaSum.update(salt); 
	shaSum.update(newPassword);
	var hashedPassword = shaSum.digest('hex');
	
	return { "pw" : hashedPassword,
		 "salt" : salt }
    }
    
    
    var changePassword = function( accountId, newPassword) { 
	var hash = makeHash(newPassword);
	
	Account.update({_id:accountId}, 
		       {$set: {password: hash.pw,
                               salt: hash.salt}},
		       {upsert:false}, 
		       function ( err) {
			   if(err) {
			       console.log("password change for accountId " + accountId + "failed in Account.js:changePassword");
			   } else {
			       console.log('password changed for account ' + accountId); 
			   }
		       }); 
    };
    
    var forgotPassword = function( email, resetPasswordUrl, callback) { 
	// todo: add a hash to the url and to the db, because this is insecure
	
	var user = Account.findOne({ "emails": { $elemMatch: {"email": email}}},
	   function(err, doc){ 
	       if (err) { 
		   // Email address is not a valid user 
		   console.log("reset password failed to find" + email);
		   callback( false); 
	       } else { 
		   console.log("sending password reset for " + email);
		   var smtpTransport = nodemailer.createTransport(' SMTP', config.mail); 
		   resetPasswordUrl += '?account =' + doc._id; 
		   smtpTransport.sendMail({ 
		       from:'repository@standardlabel.org', 
		       to: email, 
		       subject: 'Standard Label Repository Password Reset', 
		       text: 'Click here to reset your password: ' + resetPasswordUrl 
		   }, function forgotPasswordResult( err) {
		       if (err) { 
			   console.log("error sending email in Account.js:forgotPassword");
			   callback(false); 			    
		       } else { 
			   console.log("password reset email failed for "
				       +email
				       +" in Account.js:forgotPassword");
			   callback(true); 
		       } 
		   }); 
	       } 
	   }); 
    }; 
    

    //login uses the native auth data. we'll generalize later
    var login = function( username, password, callback) { 
	var user = Account.findOne({ "auths": { $elemMatch: {"type": "native", "username":username}}},
	    function (err, doc){ 
		if(err) {
		    // username not found
		    console.log("login failed to find " + username);
		    callback(false);
		} else {
		    console.log("found username " + username +". Checking password hash.");
		    if(doc.auths['native'].pw_hash == "undefined" &&
		       doc.auths['native'].pw_salt == "undefined") {
			console.log("hash or salt missing in database in Account.js:login");
			callback(false);
		    } else {
			var hash = makeHash(password,doc.auths['native'].pw_salt);
			if(hash != doc.auths['native'].pw_hash) {
			    console.log("user " + username + " failed password check in Acount.js:login");
			    callback(false);
			} else {
			    console.log("user " + username + " successfully logged in in Acount.js:login");
			    callback(true);
			}
		    }
		}
	    });
    };

    // processAuth will eventually handle auth strategies other than native, but for now that's enough
    // we also assume at registration the user will just put in one email

    // we have special handling for native auth, so we'll assume we might have to do that for others
    var processAuth = function( auth ) {
	var ret_auth = { type: auth.type };

	switch(auth.type) {
	    "native": 

	    // native auth should start with a username and a password.
	    // we'll hash and replace the password, recording the salt

	        if(typeof auth.password == "undefined") {
		    console.log("ERROR. auth.password undefined in native type in Account.js:processAuth");
		} else if (typeof auth.username == "undefined") {
		    console.log("ERROR. auth.username undefined in native type in Account.js:processAuth");
		} else {
		    var hash = makeHash(auth.password); 
		    ret_auth.username = auth.username;
		    ret_auth.pw_hash = hash.pw_hash;
		    ret_auth.pw_salt = hash.pw_salt;
		}
	        break;
	    default :
	        console.log("ERROR. auth.type undefined in Account.js:processAuth");
	} 

	return ret_auth;

    };


    var register = function( handle, auth, email) { 
	auth = processAuth(auth);
	console.log('Registering ' + handle); 
	var user = new Account({
	    "handle": handle,
	    emails: [{"email":email}], 
	    auths: [auth] 
	}); 
	user.save(function(err) { 
	    if (err) { 
		return console.log("Account save failed: " + err); 
	    }; 
	    return console.log('Account created'); 
	});

	console.log('New account creation started'); 
    };

    return { 
	register: register, 
	forgotPassword: forgotPassword, 
	changePassword: changePassword, 
	login: login, 
	Account: Account 
    } 
} 