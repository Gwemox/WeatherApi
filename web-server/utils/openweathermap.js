const LIMIT_RQ_PER_SEC = 60

//SELECT site.*, GROUP_CONCAT(practice.name) AS list_practices FROM site, practice, site_practice WHERE site_practice.id_site = site.id AND site_practice.id_practice = practice.id
const OpenWeatherMap = require("openweathermap-node");
const OpenWeatherMapHelper = new OpenWeatherMap(
    {
        APPID: process.env.API_KEY_OPENWEATHERMAP,
        units: "metric"
    }
);
const mongoose = require("mongoose");
const mysql      = require('mysql');
const connection = mysql.createConnection({
	host     : process.env.MYSQL_HOST,
	user     : process.env.MYSQL_USER,
	password : process.env.MYSQL_PASSWORD,
	database : process.env.MYSQL_DATABASE
});

module.exports = {
	startCron : function () {
		var CronJob = require('cron').CronJob;
		console.log("Démarrage de la mise à jour automatique de la météo toutes les minutes...");
		new CronJob('* * * *', function() {
			module.exports.refreshAllSite();
		}, null, true, 'Europe/Paris');
	},
	refreshAllSite : function() {
		let index = 0
		connection.query(
			"SELECT id, latitude, longitude, name FROM site WHERE last_update <= DATE_SUB(NOW(),INTERVAL 1 HOUR) OR last_update IS NULL LIMIT 60",
			function (error, results, fields) {
				results.forEach( site => {
					if (index < LIMIT_RQ_PER_SEC) {
						console.log("Refresh weather for : " + site.name);
						OpenWeatherMapHelper.getCurrentWeatherByGeoCoordinates(site.latitude, site.longitude, (err, currentWeather) => {
							if(err){
								console.log(err);
							}
							else{
								mongoose.model("WeatherSite").create({ siteId : site.id, openweathermap : currentWeather}, function(err, result) {})
								connection.query("UPDATE site SET last_update = NOW() WHERE id=" + site.id, function(){});
							}
						});
						index++;
					}
				})
			}
		);
	},
	refreshOneSite : function (siteId) {
		
	}
}
