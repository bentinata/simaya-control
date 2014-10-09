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
var	internalip	= "10.0.1.6";

var router		= express.Router();

var sys			= require('sys');
var exec		= require('child_process').exec;


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


			var child = exec("ssh -o StrictHostKeyChecking=no -i " + __dirname + "/key/" + req.params.server_name + "-vm.key azureuser@" + server.ip +" sudo reboot", function(err, stdout, stderr){
				if (err)
					res.send(err);

				sys.print('stdout:' + stdout);
				sys.print('stderr:' + stderr);
			});
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

			var child = exec("ssh -o StrictHostKeyChecking=no -i " + __dirname + "/key/" + req.params.server_name + "-vm.key azureuser@" + server.ip +" sudo reboot", function(err, stdout, stderr){
				if (err)
					res.send(err);

				sys.print('stdout:' + stdout);
				sys.print('stderr:' + stderr);
			});
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
		stat.timestamp = Date.now();
		stat.cpu = req.body.cpu;
		stat.ramcur = req.body.ramcur;
		stat.rammax = req.body.rammax;
		stat.diskcur = req.body.diskcur;
		stat.diskmax = req.body.diskmax;

		stat.save(function(err){
			if (err)
				res.send(err);

			res.json({message: 'Log saved.'});
		});
	});

router.route('/servers/:server_name/key')
	.get(function(req, res){
		// if clause here
		Server.findOne({name:req.params.server_name}, function(err, server){
			if (err)
				res.send(err);

			if (server.avail===true){
				fs.readFile(__dirname + '/key/' + req.params.server_name + '-disk.key',function(err, data){
					if (err)
						res.send(err);

					res.send(data);
				});
			}else{
				res.json({message:"Server disabled!"});
			}
		});
	})

	.put(function(req, res){
		Server.findOne({name:req.params.server_name}, function(err, server){
			if (err)
				res.send(err);

			// res.send(
			// 	"ssh -o StrictHostKeyChecking=no -i " + __dirname + "/key/" + req.params.server_name + "-vm.key azureuser@" + server.ip +" \"sudo sh -c \'curl -X GET " + internalip + ":" + port + "/api/servers/" + req.params.server_name + "/key > /etc/key.old.temp\'\"" +
			// 	" && dd if=/dev/urandom of=" + __dirname + "/key/" + req.params.server_name + "-disk.key bs=512 count=4" +
			// 	" && chmod 600 " + __dirname + "/key/" + req.params.server_name + "-disk.key" +
			// 	" && ssh -o StrictHostKeyChecking=no -i " + __dirname + "/key/" + req.params.server_name + "-vm.key azureuser@" + server.ip +" \"sudo sh -c \'curl -X GET " + internalip + ":" + port + "/api/servers/" + req.params.server_name + "/key > /etc/key.temp" +
			// 	" && cryptsetup luksAddKey /dev/sdc /etc/key.temp -S 1 -d /etc/key.old.temp" +
			// 	" && cryptsetup luksKillSlot /dev/sdc 2 -d /etc/key.old.temp" +
			// 	" && cryptsetup luksAddKey /dev/sdc /etc/key.temp -S 2 -d /etc/key.temp" +
			// 	" && cryptsetup luksKillSlot /dev/sdc 1 -d /etc/key.temp" +
			// 	" && rm /etc/key.temp" +
			// 	" && rm /etc/key.old.temp\'\"");
			var command = "ssh -o StrictHostKeyChecking=no -i " + __dirname + "/key/" + req.params.server_name + "-vm.key azureuser@" + server.ip +" \"sudo sh -c \'curl -X GET " + internalip + ":" + port + "/api/servers/" + req.params.server_name + "/key > /etc/key.old.temp\'\"" +
				" && dd if=/dev/urandom of=" + __dirname + "/key/" + req.params.server_name + "-disk.key bs=512 count=4" +
				" && chmod 600 " + __dirname + "/key/" + req.params.server_name + "-disk.key" +
				" && ssh -o StrictHostKeyChecking=no -i " + __dirname + "/key/" + req.params.server_name + "-vm.key azureuser@" + server.ip +" \"sudo sh -c \'curl -X GET " + internalip + ":" + port + "/api/servers/" + req.params.server_name + "/key > /etc/key.temp" +
				" && cryptsetup luksAddKey /dev/sdc /etc/key.temp -d /etc/key.old.temp" +
				" && cryptsetup luksRemoveKey /dev/sdc /etc/key.old.temp -d /etc/key.old.temp" +
				" && rm /etc/key.temp" +
				" && rm /etc/key.old.temp\'\"";
			console.log(command);
			var child = exec(command, function(err, stdout, stderr){

				if (err)
					res.send(err);

				sys.print('stdout:' + stdout);
				sys.print('stderr:' + stderr);
				res.json({message: "Key changed."});
			});
		});
	});

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);