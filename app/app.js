var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    port = 3081,
    message_log = {};

app.use(bodyParser.json());

app.get('*', function (req, res) {
    res.json(message_log);
});

app.post('*', function (req, res) {
	console.log("Received POST request");
    var body = req.body;

    console.log(req.url);
	
	message_log[req.url] = body;
	
    res.statusCode = 200;
	res.send();
});

var server = app.listen(port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)

});
