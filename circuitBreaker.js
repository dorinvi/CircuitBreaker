'use strict'

// const resetCount = 3;
// const resetTime = 5000; //ms
// const timeCircOn = 10000; //ms

class CircuitBreaker {

  constructor(resetCount, resetTime, circuitOnTime){
    this.resetCount = resetCount || 3;
    this.resetTime = resetTime || 5000; //ms
    this.timeCircOn = circuitOnTime || 10000; //ms

    this.timeIn;
    this.cbErrorMap = new Map(); //tracking bad req counts counts
    this.cbResetMap = new Map(); // tracking time left for timeout
    this.cbLstRqMap = new Map(); // tracking time since last req
  }

  enterCircBreak() {
    let self = this;
    return (req, res, next) => {
      self.timeIn = new Date().getTime();

      if ( ( self.cbErrorMap.get( req.url ) === undefined ) || isNaN( self.cbErrorMap.get( req.url ) ) ){
        self.cbErrorMap.set( req.url, self.resetCount);
      }
      console.log("Count: " + this.cbErrorMap.get( req.url ) );

      if ( self.cbErrorMap.get( req.url ) == 0 ) { // circuit breaker active
        console.log("Circuit Breaker Active on " + req.url );
        if( self.cbResetMap.get( req.url ) === undefined) {
          self.cbResetMap.set( req.url, self.timeIn + self.timeCircOn );
        }
        let timeRemaining = self.cbResetMap.get( req.url ) - self.timeIn;
        if ( timeRemaining < 0 ){
          self.cbErrorMap.delete( req.url );
          self.cbResetMap.delete( req.url );
          next();
        }
        else {
          res.status(503).json({ message: 'Service Temporarily Unavailable', code: timeRemaining  });
        }
      }
      else { // circuit breaker inactive
        // if time between 2 request of the same type is greater than resetTime then reset counter
        if ( (self.cbLstRqMap.get (req.url) !== undefined)   && ( (self.timeIn - self.cbLstRqMap.get (req.url)) > self.resetTime )){
          self.cbErrorMap.set( req.url, resetCount);
        }
        next();
      }
    }
  }

  exitCircBreak() {
    let self = this;
    return (req, res, next) => {
      let timeOut = new Date().getTime();
      if ( (res.statusCode >= 500) && (res.statusCode !== 503) ){
        let count =  self.cbErrorMap.get( req.url );
        self.cbErrorMap.set(req.url, --count);
      }

      self.cbLstRqMap.set(req.url, timeOut);

      console.log( 'Request: '+ req.url + ' Time: ' + (timeOut - self.timeIn) + ' ms. Code:  ' + res.statusCode);
      next();
    }
  }

  getCount( key ) {
    return this.cbErrorMap.get( key );
  }
}

module.exports.CircuitBreaker = CircuitBreaker;
