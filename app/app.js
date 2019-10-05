var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    port = process.env.PORT || 3081,
    message_log = {};

app.use(bodyParser.json());

app.get('*', function (req, res) {
    res.json(message_log);
});

function handleGithub(req, user, repo) {
    let body = req.body;
    console.log(req.url);
    message_log[req.url] = body.json;

    return 200;
}

app.post('*', function (req, res) {
    let parts = req.url.split('/');
    if(parts.length >= 3 && parts[0] == 'github'){
        res.statusCode = handleGithub(req, parts[1], parts[2]);
    } else {
        res.statusCode = 400;
    }
	res.send();
});

var server = app.listen(port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Webhook app listening at http://%s:%s', host, port)

});
