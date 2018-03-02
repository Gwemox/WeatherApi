const mongoose = require("mongoose");
const mysql      = require('mysql');
const connection = mysql.createConnection({
	host     : process.env.MYSQL_HOST,
	user     : process.env.MYSQL_USER,
	password : process.env.MYSQL_PASSWORD,
	database : process.env.MYSQL_DATABASE
});
var views = require('../utils/view');
module.exports.controller = function(router, models){
	console.log('[INFO] Export route : GET /api/sites');
	router.get('/sites', function(req,res,err){
		connection.query(
			"SELECT site.*, GROUP_CONCAT(practice.name) AS list_practices, GROUP_CONCAT(orientation.direction) AS list_directions FROM site, practice, site_practice, orientation, site_orientation WHERE site_orientation.id_site = site.id AND site_orientation.id_orientation = orientation.id AND site_practice.id_site = site.id AND site_practice.id_practice = practice.id GROUP BY site.name",
			function (error, results, fields) {
				views.responseMessage(res, 200, results);
		});		
	});
}