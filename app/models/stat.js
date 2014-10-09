var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var statSchema	= new Schema({
	name: String,
	timestamp: Date,
	cpu: Number,
	ramcur: Number,
	rammax: Number,
	diskcur: Number,
	diskmax: Number
},{
	collection: 'stats'
});
module.exports	= mongoose.model('Statistic', statSchema);