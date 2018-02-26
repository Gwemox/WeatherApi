const OpenWeatherMap = require("openweathermap-node");
const OpenWeatherMapHelper = new OpenWeatherMap(
    {
        APPID: process.env.API_KEY_OPENWEATHERMAP,
        units: "metric"
    }
);

module.exports = {
	startCron : function () {
		var CronJob = require('cron').CronJob;
		console.log("D�marrage de la mise � jour automatique de la m�t�o toutes les minutes...");
		new CronJob('30 * * * * *', function() {
			module.exports.refreshAllSite();
		}, null, true, 'Europe/Paris');
	},
	refreshAllSite : function() {
		OpenWeatherMapHelper.getCurrentWeatherByGeoCoordinates(45.745676, 4.837597, (err, currentWeather) => {
			if(err){
				console.log(err);
			}
			else{
				console.log(currentWeather);
			}
		});
	},
	refreshOneSite : function (siteId) {
		
	}
}
