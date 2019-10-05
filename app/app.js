var express = require('express'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    app = express(),
    port = process.env.PORT || 3081,
    message_log = {};

    const log = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        defaultMeta: { service: 'user-service' },
        transports: [
          //
          // - Write to all logs with level `info` and below to `combined.log` 
          // - Write all logs error (and below) to `error.log`.
          //
          new winston.transports.File({ filename: 'error.log', level: 'error' }),
          new winston.transports.File({ filename: 'combined.log' })
        ]
      });

app.use(bodyParser.json());

app.get('*', function (req, res) {
    res.json(message_log);
});

function handleGithub(req, user, repo) {
    log.log('info', 'Received github request from '+use+'/'+repo);
    let body = req.body;
    message_log[use+'/'+repo] = body.json;

    return 200;
}

app.post('*', function (req, res) {
    log.log('info', 'Received post request to '+req.url);
    let parts = req.url.split('/');
    if(parts.length >= 3 && parts[0] == 'github'){
        res.statusCode = handleGithub(req, parts[1], parts[2]);
    } else {
        res.statusCode = 400;
    }
	res.send();
});

var server = app.listen(port, function () {

    var host = server.address().address;
    var port = server.address().port;

    log.log('info', 'Webhook app listening at http://'+host+':'+port);

});
