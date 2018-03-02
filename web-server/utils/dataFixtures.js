var mysql      = require('mysql');

var connection = mysql.createConnection({
	host     : process.env.MYSQL_HOST,
	user     : process.env.MYSQL_USER,
	password : process.env.MYSQL_PASSWORD,
	database : process.env.MYSQL_DATABASE
});

connection.on('error', function(err) {
  console.error("[mysql error]",err);
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
  
// Create Table 
	connection.query(
	"CREATE TABLE IF NOT EXISTS `site` (`id` int(11) NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL UNIQUE, `zipcode` varchar(5) NOT NULL, `latitude` double NOT NULL, `longitude` double NOT NULL, `structure` int(11) DEFAULT NULL, `identity` varchar(20) NOT NULL, `last_update` DATETIME, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;",
		function (error, results, fields) {
			if (error) throw error;
			// Create Table 
			connection.query(
				"CREATE TABLE IF NOT EXISTS `practice` ( `id` int(11) NOT NULL AUTO_INCREMENT, `name` varchar(50) NOT NULL UNIQUE, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;",
				function (error, results, fields) {
					if (error) throw error;
					// Create Table 
					connection.query(
						"CREATE TABLE IF NOT EXISTS `orientation` ( `id` int(11) NOT NULL AUTO_INCREMENT, `direction` varchar(50) NOT NULL UNIQUE, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;",
						function (error, results, fields) {
							if (error) throw error;
							// Create Jointure Table 
							connection.query(
								"CREATE TABLE IF NOT EXISTS `site_orientation` ( `id` int(11) NOT NULL AUTO_INCREMENT, `id_site` int(11) NOT NULL, `id_orientation` int(11) NOT NULL, PRIMARY KEY (`id`), KEY `id_orientation` (`id_orientation`), KEY `id_site` (`id_site`), CONSTRAINT `site_orientation_ibfk_1` FOREIGN KEY (`id_orientation`) REFERENCES `orientation` (`id`), CONSTRAINT `site_orientation_ibfk_2` FOREIGN KEY (`id_site`) REFERENCES `site` (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;",
								function (error, results, fields) {
									if (error) throw error;
									// Create Jointure Table 
									connection.query(
										"CREATE TABLE IF NOT EXISTS `site_practice` ( `id` int(11) NOT NULL AUTO_INCREMENT, `id_site` int(11) NOT NULL, `id_practice` int(11) NOT NULL, PRIMARY KEY (`id`), KEY `id_practice` (`id_practice`), KEY `id_site` (`id_site`), CONSTRAINT `site_practice_ibfk_1` FOREIGN KEY (`id_practice`) REFERENCES `practice` (`id`), CONSTRAINT `site_practice_ibfk_2` FOREIGN KEY (`id_site`) REFERENCES `site` (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;",
										function (error, results, fields) {
											if (error) throw error;
											syncData();
										}
									);
								}
							);	
						}
					);
				}
			);
		}
	);
});

async function syncData() {
	
	var fs = require('fs'),
    xml2js = require('xml2js');
 
	var parser = new xml2js.Parser();
	fs.readFile(__dirname + '/decollages.xml', function(err, dataFile) {
		parser.parseString(dataFile, function (err, result) {
			let total = result.sites.site.length;
			let index = 0;
			console.log("Populate database...");
			populateSite(result, 0, total);
		});
	});
}

function populateSite (result, index, total){
	let site = result.sites.site[index];
	let data = {}
	data.identity = site['$'].identifiant;
	data.name = site.nom[0].replace(/\\/g, "\\\\")
	   .replace(/\$/g, "\\$")
	   .replace(/'/g, "\\'")
	   .replace(/"/g, "\\\"")
	   .trim();
	data.zipcode = site.codepostal[0]['$'].value;
	data.latitude = site.coord[0]['$'].lat;
	data.longitude = site.coord[0]['$'].lon;
	data.structure = site.structure[0]['$'].value;
	
	data.promises = [];
	
	data.practices = [];
	if (site.pratiques && site.pratiques[0].pratique) {
		site.pratiques[0].pratique.forEach(function(practice) {
			data.practices.push({name : practice['$'].value.trim()})
		});
	}
	
	data.orientations = [];
	if (site.orientations && site.orientations[0].orientation) {
		site.orientations[0].orientation.forEach(function(orientation) {
			data.orientations.push({direction : orientation['$'].value.trim()})
		});
	}
	
	(new Promise(function(resolve, reject) {
		connection.query(
			"INSERT IGNORE INTO site(name, zipcode, latitude, longitude, structure, identity) VALUES ('" + data.name + "', '" + data.zipcode + "', " + data.latitude + ", " + data.longitude + ", " + data.structure + ", '" + data.identity + "');",
			function (error, insertSite, fields) {
				if (error) reject(error);
				data.idSite = insertSite.insertId;
				resolve();
			}
		);
	})).catch(function (error) {
		console.log(error);
	}).then(function () {
		if (data.idSite > 0) 
		{
			data.practices.forEach(function (practice) {
				data.promises.push(new Promise(function(resolve, reject) {
					connection.query(
						"INSERT IGNORE INTO practice(name) VALUES ('" + practice.name + "');",
						function (errorPractice, insertPractice, fields) {
							if (errorPractice) reject(errorPractice);
							connection.query(
								"INSERT IGNORE INTO site_practice(id_site, id_practice) VALUES (" + data.idSite + ", (SELECT id FROM practice WHERE name = '" + practice.name + "'));",
								function (errorSitePractice, insertSitePractice, fields) {
									if (errorSitePractice) reject(errorSitePractice);
									resolve();
								}
							);
						}
					);
				}));
			});
			
			data.orientations.forEach(function (orientation) {
				data.promises.push(new Promise(function(resolve, reject) {
					connection.query(
						"INSERT IGNORE INTO orientation(direction) VALUES ('" + orientation.direction + "');",
						function (errorOrientation, insertOrientation, fields) {
							if (errorOrientation) reject(errorOrientation);
							connection.query(
								"INSERT IGNORE INTO site_orientation(id_site, id_orientation) VALUES (" + data.idSite + ", (SELECT id FROM orientation WHERE direction = '" + orientation.direction + "'));",
								function (errorSiteOrientation, insertSiteOrientation, fields) {
									if (errorSiteOrientation) reject(errorSiteOrientation);
									resolve();
								}
							);
						}
					);
				}));
			});
		}
		
		Promise.all(data.promises).catch(function (error) {
			console.log(error);
		})
		.then(function () {
			index++;
			console.log('Populate database : ' + index + '/' + total);
			delete data;
			if (index < total) {
				populateSite(result, index, total);
			}
		});
	});
}
