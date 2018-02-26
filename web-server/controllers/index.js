module.exports.controller = function(router, models){
  router.get('/', function(req, res, err) {
      res.json({version: 1.0});
  });
}
