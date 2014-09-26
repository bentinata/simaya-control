var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var statSchema	= new Schema({
	name: String,
	cpu: String,
	ram: String,
	disk: String,
},{
	collection: 'stats'
});
module.exports	= mongoose.model('Statistic', statSchema);