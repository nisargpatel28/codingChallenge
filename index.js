const express = require('express');
const path    = require('path');
const app     = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
//var helperFn = require('./apiCalls');
const api_helper = require('./API_helper')
const db_helper = require('./DB_helper')

/* Start Database connection */
// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'nisarg99',
    database: 'cc'
});

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

/* End Database connection */

app.set('view engine', 'ejs');
app.use('/static', express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// create application/json parser
var jsonParser = bodyParser.json(); 

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const apiCalls = require('./apiCalls');

app.get('/', function(req, res) {
	res.render('index.ejs', {title: 'Coding Challenge', testnetAddressField: '', testnetAddress: 'N/A', balanceAc: 'N/A' });
});

app.post('/', urlencodedParser, function(req, res) {
	var balanceAc = 0;
	new Promise(function(resolve, reject) {
	    api_helper.make_API_call('https://api.blockcypher.com/v1/btc/main/addrs/'+req.body.testnetAddress+'/balance')
	    .then(response => {
	    	var balanceAc = response.balance;
	    	if( typeof balanceAc === 'undefined')
	    	{
	    		balanceAc = 'N/A';
	    	}
	    	res.render('index.ejs', {title: 'Coding Challenge', testnetAddressField: req.body.testnetAddress, testnetAddress: req.body.testnetAddress, balanceAc: balanceAc});
	    })
	    .catch(error => {
	    	console.log("Error=>", error);
	    })
	});	
});

app.get('/checkbalance', function(req, res) {
	res.render('checkBalance.ejs', {title: 'Coding Challenge', testnetAddressField: '', testnetAddress: 'N/A', balanceAc: 'N/A' });
});

app.post('/checkbalance', urlencodedParser, function(req, res) {
	var balanceAc = 0;
	new Promise(function(resolve, reject) {
	    api_helper.make_API_call('https://api.blockcypher.com/v1/btc/main/addrs/'+req.body.testnetAddress+'/balance')
	    .then(response => {
	    	var balanceAc = response.balance;
	    	if( typeof balanceAc === 'undefined')
	    	{
	    		balanceAc = 'N/A';
	    	}
	    	res.render('checkBalance.ejs', {title: 'Coding Challenge', testnetAddressField: req.body.testnetAddress, testnetAddress: req.body.testnetAddress, balanceAc: balanceAc});
	    })
	    .catch(error => {
	    	console.log("Error=>", error);
	    })
	});	
});

app.get('/payment', urlencodedParser, function(req, res) {
	new Promise(function(resolve, reject) {
	    db_helper.getTransactions().then(response => {
	    	var allTransactions = response;
	    	res.render('payment.ejs', {title: 'Coding Challenge', allTransactions: allTransactions});
	    })
	    .catch(error => {
	    	console.log("Error=>", error);
	    })
	});	
});

app.post('/payment', urlencodedParser, function(req, res) {
	new Promise(function(resolve, reject) {
	    db_helper.addTransaction(req).then(response => {
	    	db_helper.getTransactions().then(response => {
		    	var allTransactions = response;
		    	res.render('payment.ejs', {title: 'Coding Challenge', allTransactions: allTransactions});
		    })
		    .catch(error => {
		    	console.log("Error=>", error);
		    })
	    })
	    .catch(error => {
	    	console.log("Error=>", error);
	    })
	});	
	//var balanceAc = 0;
	// new Promise(function(resolve, reject) {
	//     api_helper.make_API_call('https://api.blockcypher.com/v1/btc/main/addrs/'+req.body.testnetAddress+'/balance')
	//     .then(response => {
	//     	var balanceAc = response.balance;
	//     	if( typeof balanceAc === 'undefined')
	//     	{
	//     		balanceAc = 'N/A';
	//     	}
	//     	res.render('index.ejs', {title: 'Coding Challenge', testnetAddressField: req.body.testnetAddress, testnetAddress: req.body.testnetAddress, balanceAc: balanceAc});
	//     })
	//     .catch(error => {
	//     	console.log("Error=>", error);
	//     })
	// });	
});
app.listen(3000);