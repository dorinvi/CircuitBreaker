'use strict'

let express = require('express');
let rnd = require('./randomStatus');
let ccb = require('./circuitBreaker');
let app = express();

app.use( ccb.enterCircBreak );
app.get('/', function(req, res, next) {
//  setTimeout(function(){
//    console.log('100ms timeout ...');
    let statusCode = rnd.getStatusCode();
    res.status( statusCode ).json({ route: 'Home', count: ccb.getCount(req.url), status: statusCode });
    next();
//  }, 100);
});
app.get('/health', function(req, res, next) {
    res.status( rnd.getStatusCode() ).json({ route: 'Health'});
    next();
});

app.get('/info/:id', function(req, res, next) {
    res.status( rnd.getStatusCode() ).json({ route: 'Info'});
    next();
});

app.use( ccb.exitCircBreak );

let server = app.listen(8081, () => {
  let host = server.address().address;
  let port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port)
});


//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
//http://stackoverflow.com/questions/10563644/how-to-specify-http-error-code
