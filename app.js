var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var app = express()
var interval
var interval_switch
var urlencodeParser = bodyParser.urlencoded({extended: false})
var decider = false 
var time 

//Import 
let Simulation = require('./models/simulate')
let SuitSwitch = require('./models/suitswitch')

//Database connector
mongoose.connect('mongodb://admin:B29R233@cluster0-shard-00-00-4mutn.mongodb.net:27017,'+
'cluster0-shard-00-01-4mutn.mongodb.net:27017,cluster0-shard-00-02-4mutn.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true')
//mongoose.connect('mongodb://localhost/spacesuit');

//EJS framework for website display
app.set('view engine', 'ejs')
app.use('/assets', express.static('assets'))

//ROUTES
app.get('/',function(req, res){
	res.render('index')
})

//On start button, simulation starts
app.post('/', urlencodeParser, function(req, res){
	console.log('--------------Simulation started--------------')

	time = Date.now() 
	interval = setInterval(Simulation.suitTelemetry.bind(null, time, decider),1000)
	interval_switch = setInterval(SuitSwitch.SuitSwitch.bind(null,decider),1000)

	res.render('error_ready',{qs: ''})
})

app.post('/error-ready',urlencodeParser, function(req, res){
	console.log('-> Error calculation active!')

	//Stop standard simulation
	clearInterval(interval)
	clearInterval(interval_switch)

	decider = true 

	//Start alternative simulation
	interval = setInterval(Simulation.suitTelemetry.bind(null, time, decider),1000)
	interval_switch = setInterval(SuitSwitch.SuitSwitch.bind(null,decider),1000)

	res.render('error_resolver',{qs: req.query})
})

app.get('/error-ready',function(req, res){
	res.render('error_ready',{qs: req.query})
})

app.post('/resolver',urlencodeParser, function(req, res){
	console.log('-> Normal calculation active!')

	//Stop standard simulation
	clearInterval(interval)
	clearInterval(interval_switch)
    
	decider = false 
    
	//Start alternative simulation
	interval = setInterval(Simulation.suitTelemetry.bind(null, time, decider),1000)
	interval_switch = setInterval(SuitSwitch.SuitSwitch.bind(null,decider),1000)



	res.render('contact',{qs: req.query})
})

app.get('/resolver',function(req, res){
	res.render('error_resolver',{qs: req.query})
})

app.get('/contact',function(req, res){
	res.render('contact',{qs: req.query})
})

app.post('/contact', urlencodeParser, function(req, res){
	console.log('--------------Simulation stopped--------------')
	clearInterval(interval)
	clearInterval(interval_switch)
	res.render('contact-success',{data: req.body})
})




//Returns all simulated data from the database
app.get('/api/suit', function(req, res){      
	Simulation.getSuitTelemetry(function (err, data) {
		if (err) {
			throw err
			console.log(err)
		}
		res.json(data)
	})
})

app.get('/api/suit/recent', function(req, res){      
	Simulation.getSuitTelemetryByDate(function (err, data) {
		if (err) {
			throw err
			console.log(err)
		}
		res.json(data)
	})
})

app.get('/api/suitswitch', function(req, res){      
	SuitSwitch.getSuitSwitch(function (err, data) {
		if (err) {
			throw err
			console.log(err)
		}
		res.json(data)
	})
})

app.get('/api/suitswitch/recent', function(req, res){      
	SuitSwitch.getSuitSwitchByDate(function (err, data) {
		if (err) {
			throw err
			console.log(err)
		}
		res.json(data)
	})
})


// app.listen(process.env.PORT || 3000, function(){
// 	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
// });
app.listen(process.env.PORT || 3000)
console.log('Server is running on port 3000...')
