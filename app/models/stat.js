var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var statSchema	= new Schema({
	name: String,
	cpu: int,
	ramcur: int,
	rammax: int,
	diskcur: int,
	diskmax: int
},{
	collection: 'stats'
});
module.exports	= mongoose.model('Statistic', statSchema);