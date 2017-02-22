'use strict'

module.exports.enterCircBreak = enterCircBreak;
module.exports.exitCircBreak = exitCircBreak;
module.exports.getCount = getCount;

let timeIn;
let cbErrorMap = new Map(); //tracking bad req counts counts
let cbResetMap = new Map(); // tracking time left for timeout
let cbLstRqMap = new Map(); // tracking time since last req

const resetCount = 3;
const resetTime = 5000; //ms
const timeCircOn = 10000; //ms

function enterCircBreak(req, res, next) {
  timeIn = new Date().getTime();

  if ( ( cbErrorMap.get( req.url ) === undefined ) || isNaN( cbErrorMap.get( req.url ) ) ){
      cbErrorMap.set( req.url, resetCount);
  }
  console.log("Count: " + cbErrorMap.get( req.url ) );

  if ( cbErrorMap.get( req.url ) == 0 ) { // circuit breaker active
    console.log("Circuit Breaker Active on " + req.url );
    if( cbResetMap.get( req.url ) === undefined) {
      cbResetMap.set( req.url, timeIn + timeCircOn );
    }
    let timeRemaining = cbResetMap.get( req.url ) - timeIn;
    if ( timeRemaining < 0 ){
      cbErrorMap.delete( req.url );
      cbResetMap.delete( req.url );
      next();
    }
    else {
      res.status(503).json({ message: 'Service Temporarily Unavailable', code: timeRemaining  });
    }
  }
  else { // circuit breaker inactive
    // if time between 2 request of the same type is greater than resetTime then reset counter
    if ( (cbLstRqMap.get (req.url) !== undefined)   && ( (timeIn - cbLstRqMap.get (req.url)) > resetTime )){
      cbErrorMap.set( req.url, resetCount);
    }
    next();
  }
}

function exitCircBreak(req, res, next) {
  let timeOut = new Date().getTime();
  if ( (res.statusCode >= 500) && (res.statusCode !== 503) ){
    let count =  cbErrorMap.get( req.url );
    cbErrorMap.set(req.url, --count);
  }

  cbLstRqMap.set(req.url, timeOut);

  console.log( 'Request: '+ req.url + ' Time: ' + (timeOut - timeIn) + ' ms. Code:  ' + res.statusCode);
  next();
}

function getCount( key ) {
  return cbErrorMap.get( key );
}
