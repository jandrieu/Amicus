use label_repo


joeLabel = {
					xUID: 1,
					version : 1,
          current : true,
          name: "Joe",
          title: "Co-Chair",
					start_date: new Date("June 2, 2010"),
					rev_comment: "Initialized"
				};
				
db.labels.insert(joeLabel);
db.labels.find();				
/*
{ "_id" : ObjectId("510cba9c8e298100c448069c"), "xUID" : 1, "version" : 1, "current" : true, "name" : "Joe", "title" : "Co-Chair", "start_date" : ISODate("2010-06-02T00:00:00Z"), "rev_comment" : "Initialized" }
*/
				
iainLabel = { 
					xUID: 2,
					version : 1,
          current : true,
          name: "Iain",
          title: "Co-Chair",
					start_date: new Date("June 1, 2010"),
					rev_comment: "Initialized"
				};
				
db.labels.insert(iainLabel);
db.labels.find();				

/* 
{ "_id" : ObjectId("510cba9c8e298100c448069c"), "xUID" : 1, "version" : 1, "current" : true, "name" : "Joe", "title" : "Co-Chair", "start_date" : ISODate("2010-06-02T00:00:00Z"), "rev_comment" : "Initialized" }
{ "_id" : ObjectId("510cbaece6ce07749bc58d69"), "xUID" : 2, "version" : 1, "current" : true, "name" : "Iain", "title" : "Co-Chair", "start_date" : ISODate("2010-06-01T00:00:00Z"), "rev_comment" : "Initialized" }
*/


var AuthSchema = new mongoose.Schema({
    auth_type: { type:String },
    username: {type:String, required: false},
    pw_hash: {type:String, required: false},
    pw_salt: {type:String, required: false}
});

var EmailSchema = new mongoose.Schema({
    email: {type: String}
});

var AccountSchema = new mongoose.Schema({
    endpoint: { type: String, unique: true, required: false},
    handle: { type: String },
    email: [{ type: EmailSchema }],
    auth: [{ type: AuthSchema}]

iainEditor = {
  handle: "Iain Henderson",
	emails: [ {email: "iainhenderson@mac.com"},
		{email: "iain.henderson@gmail.com"},
		{email: "iain@thecustomersvoice.com"}
	],
	auths: [{
		 type: "native",
		 username: "iain"
		}]
}
db.editors.insert(iainEditor);

joeEditor = {
  handle: "Joe Andrieu",
	emails: [ {email: "joe@andrieu.net"},
		{email: "joe@switchbook.com"},
		{email: "joandrieu@gmail.com"}
	],
	auths: [{
		 type: "native",
		 username: "joe"
		}]
} 

db.editors.insert(joeEditor);
db.editors.find();
db.editors.find({ "emails": { $elemMatch: {email: "joe@switchbook.com"}}});
db.editors.findOne({ "auths": { $elemMatch: {"type": "native", "username":"joe"}}})

/*
{ "_id" : ObjectId("510cb8a58e298100c448069a"), "handle" : "Iain Henderson", "emails" : [       "iainhenderson@mac.com",        "iain.henderson@gmail.com",   "iain@thecustomersvoice.com" ], "auths" : [ { "type" : "native", "username" : "iain" } ] }
{ "_id" : ObjectId("510cb8ce8e298100c448069b"), "handle" : "Joe Andrieu", "emails" : [ "joe@andrieu.net", "joe@switchbook.com", "joandrieu@gmail.com" ], "auths" : [ { "type" : "native", "username" : "joe" } ] }
*/

db.labels.ensureIndex({xUID:1});

