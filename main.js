var express		= require('express');
var app			= express();
var bodyParser	= require('body-parser');
var fs			= require('fs');

var mongoose	= require('mongoose');
mongoose.connect('mongodb://localhost:27017/server');

var Server		= require('./app/models/server');
var Stat		= require('./app/models/stat');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port		= process.env.PORT || 8080;

var router		= express.Router();

router.use(function(req, res, next){
	console.log('HTTP Request.');
	next();
});

router.get('/', function(req, res) {
	res.json({ message: 'siMAYA monitoring API v1.' });
});

router.route('/servers')

	.post(function(req, res){
		var server = new Server();
		server.status = req.body.status;
		server.last = Date.now();
		server.avail = true;
		server.ip = req.body.ip;
		server.name = req.body.name;

		server.save(function(err){
			if (err)
				res.send(err);

			res.json({message: 'Server created!'});
		});
	})

	.get(function(req, res){	// this override that
		Server.find(function(err, servers){
			if (err)
				res.send(err);

			res.json(servers);
		});
	});

router.route('/servers/:server_name')
	.get(function(req, res){
		Server.findOne({name: req.params.server_name}, function(err, server){
			if (err)
				res.send(err);

			res.json(server);
		});
	})

	.put(function(req, res){	// edit data
		Server.findOne({name: req.params.server_name}, function(err, server){
			if (err)
				res.send(err);

			server.status = req.body.status;
			server.last = Date.now();

			server.save(function(err){
				if (err)
					res.send(err);

				res.json({message: "Server updated."});
			});
		});
	});

router.route('/servers/:server_name/disable')
	.put(function(req, res){
		Server.findOne({name: req.params.server_name}, function(err, server){
			if (err)
				res.send(err);

			server.avail = false;

			server.save(function(err){
				if (err)
					res.send(err);

				res.json({message: "Server disabled."});
			});
		});
	});

router.route('/servers/:server_name/enable')
	.put(function(req, res){
		Server.findOne({name: req.params.server_name}, function(err, server){
			if (err)
				res.send(err);

			server.avail = true;

			server.save(function(err){
				if (err)
					res.send(err);

				res.json({message: "Server enabled."});
			});
		});
	});

router.route('/servers/:server_name/stats')
	.get(function(req, res){
		Stat.findOne({name: req.params.server_name}, function(err, stat){
			if (err)
				res.send(err);

			res.json(stat);
		});
	})

	.post(function(req, res){
		var stat = new Stat();
		// statistics.status = req.body.status;
		// statistics.ip = req.body.ip;
		stat.name = req.params.server_name;
		stat.cpu = req.body.cpu;
		stat.ramcur = req.body.ramcur;
		stat.rammax = req.body.rammax;
		stat.diskcur = req.body.diskcur;
		stat.diskmax = req.body.diskmax;

		stat.save(function(err){
			if (err)
				res.send(err);

			res.json({message: 'Log saved...'});
		});
	});

router.route('/servers/:server_name/key')
	.get(function(req, res){
		// if clause here
		Server.findOne({name:req.params.server_name}, function(err, server){
			if (server.avail===true){
				fs.readFile('key\\' + req.params.server_name + '.key',function(err, data){
					if (err)
						res.send(err);

					res.send(data);
				});
			}else{
				res.json({message:"Server disabled!"})
			}
		});
	});

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);