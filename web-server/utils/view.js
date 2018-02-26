module.exports = {
	setHeaders : function setHeaders(res, status_code){
		res.set('Content-Type', 'application/json');
		res.status(status_code)
	},
	responseMessage : function responseMessage(res, status_code, message) {
		module.exports.setHeaders(res, status_code);
		res.send({"status": status_code, "message": message});
	}
}