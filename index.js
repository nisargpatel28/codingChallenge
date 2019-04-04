const express     = require('express');
const path        = require('path');
const app         = express();
const bodyParser  = require('body-parser');
const mysql 	  = require('mysql');
const ChartjsNode = require('chartjs-node');
const api_helper = require('./helper/API_helper')
const db_helper = require('./helper/DB_helper')

/* Start Database connection */
// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
const db = mysql.createConnection ({
    host: "localhost",
    user: "root",
    password: "nisarg99",
    database: "cc"
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

app.get('/', function(req, res) {
	new Promise(function(resolve, reject) {
	    db_helper.getTransactions().then(response => {
	    	var allTransactions = response;
	    	var accountNumbers = [];
	    	var accountAmounts = [];
	    	for( var i = 0 ; i < allTransactions.length; i++ )
	    	{
				accountNumbers.push(allTransactions[i].tAccount);
				accountAmounts.push(allTransactions[i].tAmount);
	    	}
	    	var chartNode = new ChartjsNode(600, 600);
			var myChartData = {
					labels: accountNumbers,
					datasets: [{
						label: 'Account And Balance',
						backgroundColor: "red",
						borderColor: "red",
						borderWidth: 1,
						data: accountAmounts
					}]
				};
			var myChartOptions = {};
			var chartJsOptions = {
			    type: 'bar',
			    data: myChartData,
			    options: myChartOptions
			};
			chartNode.drawChart(chartJsOptions)
			.then(() => {
			    // chart is created
			 
			    // get image as png buffer
			    chartNode.getImageBuffer('image/png');
			})
			.then(buffer => {
			    Array.isArray(buffer) // => true
			    // as a stream
			    chartNode.getImageStream('image/png');
			})
			.then(streamResult => {
			    // using the length property you can do things like
			    // directly upload the image to s3 by using the
			    // stream and length properties
			    //streamResult.stream // => Stream object
			    //streamResult.length // => Integer length of stream
			    // write to a file
			    chartNode.writeImageToFile('image/png', './public/img/accountBalance.png');
			})
			.then(() => {
			    // chart is now written to the file path
			    // ./accountBalance.png
			});
			res.render('index.ejs', {title: 'Coding Challenge', testnetAddressField: '', testnetAddress: 'N/A', balanceAc: 'N/A' });
	    })
	    .catch(error => {
	    	console.log("Error=>", error);
	    })
	});	
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
});
app.listen(3000);