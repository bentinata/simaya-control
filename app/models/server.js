var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var servSchema	= new Schema({
	name: String,
	ip: String,
	avail: Boolean,
	status: String,
	last: Date
},{
	collection: 'servers'
});

module.exports	= mongoose.model('Server', servSchema);