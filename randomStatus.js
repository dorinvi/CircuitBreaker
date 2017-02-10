'use strict'

module.exports.getStatusCode = getStatusCode;

let randomDebug;
const statusCodes = [200, 201, 202, 203, 204, 205, 500, 501, 502, 504, 505, 506, 507, 508];

function getStatusCode(){
  let randomStatus =  Math.floor ( Math.random() * statusCodes.length );
  return statusCodes[ randomStatus ];
}
