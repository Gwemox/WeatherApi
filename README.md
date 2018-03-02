# Weather

Thibault Buathier
Nathan Molle

# Requis : 
- Docker
- Docker-compose

# Lancement de tous les container 

	docker-compose up --build
	
Les bases de données SQL & MongoDB seront automatiquement créées. L'API récupère la météo sur OpenWeatherMap toutes les minutes de 60 sites (car c'est la limite). Actuellement il y a 967 sites donc il faut 17 minutes pour tous les mettre à jour.

Vous pouvez accéder à des PHPMyAdmin en local des mysql_master et mysql_slave respectivement aux adresses :
- localhost:8080/
- localhost:8081/

Les mongoDB exposent leur port 27017 sur la machine sur les ports 27018 (mongo 1) - 27019 (mongo 2) - 27020 (mongo 3)

Le port du webserver (3000) est exposé sur le port 80 de la machine, c'est à dire que l'API est à cette addresse : http://localhost:80

Voici les routes possibles :
web-server_1         | [INFO] Export route : GET /api/sites <<<< Liste des sites disponibles

web-server_1         | [INFO] Export route : POST /api/weathersite <<<< Ajouter une donnée météo

web-server_1         | [INFO] Export route : GET /api/weathersites <<<< Récupérer toutes les données météos LIMITE de 10

web-server_1         | [INFO] Export route : GET /api/weathersite/:id <<<< Récupère une donnée météo

web-server_1         | [INFO] Export route : PATCH /api/weathersite/:id <<<< Modifie une donnée météo

web-server_1         | [INFO] Export route : DELETE /api/weathersite/:id <<<< Supprime une donnée météo

web-server_1         | [INFO] Export route : GET /api/canFly/:id <<<< Indique si on peut voler sur un site donné (idSite récupérable dans la liste des sites)


**Le diagramme de la base de donnée est disponible au format SVG dans le fichier : weather_api.svg**