var express = require('express'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    https = require('https'),
    config = require('./config'),
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

function send_mobile_update(commits) {
    let text = "Mobilebot on päivitetty.";
    for (let i = 0; i < commits.length; i++) {
        let c = commits[i];
        text.append("1. "+c.message+"\n");
    }

    let body = {
        chat_id: config.telegram.mobile_id,
        text: text,
    };

    let options = {
        host: "https://api.telegram.org",
        path: "/bot"+config.telegram.mobilebotbot.token+"/sendMessage",
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    };

    let req = https.request(options, function(res){
        var responseString = "";
        res.on("data", function (data) {
            responseString += data;
            });
        res.on("end", function () {
            console.log(responseString); 
        });
    });

    req.write(JSON.stringify(body));
}

function handleGithub(req, user, repo) {
    log.log('info', 'Received github request from '+user+'/'+repo);
    let body = req.body;
    message_log[user+'/'+repo] = body.json;

    let repo_name = body.json.repository.full_name;
    if(repo_name == "toppeh/mobilebot" && body.json.ref == "refs/heads/master") {
        send_mobile_update(body.json.commits);
    }

    return 200;
}

app.post('*', function (req, res) {
    log.log('info', 'Received post request to '+req.url);
    let parts = req.url.split('/').filter(i=>i);
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
