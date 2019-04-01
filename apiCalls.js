const https = require('https'); 
var request = require('request');

module.exports = {
    getJSON: function(urlToCall) {
        request('http://www.google.com', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body) // Print the google web page.
          }
        })
    }
}