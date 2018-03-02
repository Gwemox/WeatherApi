const mongoose = require("mongoose");
const mysql      = require('mysql');
const connection = mysql.createConnection({
	host     : process.env.MYSQL_HOST,
	user     : process.env.MYSQL_USER,
	password : process.env.MYSQL_PASSWORD,
	database : process.env.MYSQL_DATABASE
});

var views = require('../utils/view');

var CardinalPoint = {
    "N":[348.75,11.25],
    "NNE":[11.25, 33.75],
    "NE":[33.75,56.25],
    "ENE":[56.25,78.75],
    "E":[75.75,101.25],
    "ESE":[101.25,123.75],
    "SE":[123.75,146.25],
    "SSE":[146.25,168.75],
    "S":[168.75,191.25],
    "SSO":[191.25,213.75],
    "SO":[213.75,236.25],
    "OSO":[236.25,258.75],
    "O":[258.75,281.25],
    "ONO":[281.25,303.75],
    "NO":[303.75,326.25],
    "NNO":[326.25,348.75],
	"TOUTES":[0,360]
}

function getDeg(direction) {
	for(var dir in CardinalPoint) {
	   if(dir.toLowerCase().trim() === direction.toLowerCase().trim())
			return CardinalPoint[dir];
	}
}

function checkDirWind(goodDir, _wind){
	var directions = goodDir.split(',');
	
	directions.forEach(function (direction){
		let degr = getDeg(direction);
		if (_wind.deg >= degr[0] && _wind.deg <= degr[1]) {
			return true
		}
	});
	return false;
}

module.exports.controller = function(router, models){
	console.log('[INFO] Export route : GET /api/canFly/:id');
	router.get('/canFly/:id', function(req,res,err){
		mongoose.model("WeatherSite").findOneEnabled({siteId: req.params.id}, function(err, result){
			if (err) views.responseMessage(res, 400, err);
			else if(!result) views.responseMessage(res, 400, {message : "Can't found weather !"});
			else {
				connection.query(
					"SELECT site.*, GROUP_CONCAT(orientation.direction) AS list_directions FROM site, orientation, site_orientation WHERE site_orientation.id_site = site.id AND site_orientation.id_orientation = orientation.id AND site.id = " + req.params.id + " GROUP BY site.name",
					function (error, results, fields) {
						if (results.length > 0) {
							let dirWind = checkDirWind(results[0]['list_directions'], result.openweathermap.wind);
							let speedWind = (result.openweathermap.wind.speed * 3.6) <= 35;
							let weather = (result.openweathermap.weather[0].id >= 800 && result.openweathermap.weather[0].id <= 804);
							let resultat = {
								id : req.params.id,
								canFly : dirWind && speedWind && weather,
								dirWindIsOk : dirWind,
								speedWindIsOk : speedWind,
								weatherIsOk : weather,
								weather : result.openweathermap
							}
							views.responseMessage(res, 200, resultat);
						} else {
							views.responseMessage(res, 400, {message : "Can't found weather !"});
						}
				});
			}
		});
	});
}