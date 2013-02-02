var express = require('express'); 
var app = express(); 

app.configure( function(){ 
    app.set('view engine', 'jade'); 
    app.use( express.static(__dirname + '/public')); 
}); 

app.get('/', function( req, res){ 
    res.render("index.jade", {layout:false}); 
}); 

app.get('/ account/ authenticated', function( req, res) { 
    if ( req.session.loggedIn ) { 
	res.send( 200); 
    } else { 
	res.send( 401); 
    } 
});


app.listen( 8080);
console.log("Standard Label listening at 8080");
