const mongoose = require("mongoose");
var views = require('../utils/view');
module.exports.controller = function(router, models){
    for (var model in models) {
        let modelClass = models[model];
        let route = '/' + modelClass.name.toLowerCase();

        console.log('[INFO] Export route : POST /api' + route);
        router.post(route, function(req,res,err){
            mongoose.model(modelClass.name).create(req.body, function(err, result) {
                if (err) {
                    views.responseMessage(res, 400, err);
                } else {
                    views.responseMessage(res, 201, result);
                }
            })
        });

        console.log('[INFO] Export route : GET /api' + modelClass.routeGets);
        router.get(modelClass.routeGets, function(req, res, err) {
            mongoose.model(modelClass.name).findEnabled({}, function(err, result){
                if (err) views.responseMessage(res, 400, err);
                else views.responseMessage(res, 200, result);
            }, req.query.limit, req.query.offset);
        });

        console.log('[INFO] Export route : GET /api' + route + '/:id');
        router.get(route + '/:id', function(req,res,err){
            mongoose.model(modelClass.name).findOneEnabled({_id: req.params.id}, function(err, resultat){
                if (err) views.responseMessage(res, 400, err);
                else views.responseMessage(res, 200, resultat);
            });
        });

        console.log('[INFO] Export route : PATCH /api' + route + '/:id');
        router.patch(route + '/:id', function(req,res,err){
            var id = req.params.id;

            mongoose.model(modelClass.name).findOneEnabled({_id: id}, function(error, entity){
                if (error) views.responseMessage(res, 400, err);
                else {
                    Object.keys(req.body).forEach(function (key) {
                        entity[key] = req.body[key];
                    });
                    entity.save(function (err, updated){
                        if (err) views.responseMessage(res, 400, err);
                        else res.status(204).send();
                    })
                }
            });
        })

        console.log('[INFO] Export route : DELETE /api' + route + '/:id');
        router.delete(route + '/:id', function(req,res,err){
            var id = req.params.id;
            if (!id){
                views.responseMessage(res, 400, "Missing field 'id'");
            }
            else {
                mongoose.model(modelClass.name).findByIdAndUpdate({_id: id}, {disabled: true}, function (err, resu) {
                    if (err) {
                        views.responseMessage(res, 400, err);
                    }
                    else {
						views.responseMessage(res, 200, "Entity deleted");
                    }
                })
            }
        });
    }
}