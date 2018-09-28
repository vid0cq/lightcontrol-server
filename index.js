var TPLSmartDevice = require('tplink-lightbulb');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/lux', function (req, res){
  res.send('value:' + req.query.value);
  
  var msg={
      "smartlife.iot.smartbulb.lightingservice": {
        "transition_light_state": {
          "on_off": 1,
          "transition_period": 0,
          "brightness": parseInt(req.query.value)
        }
      }
    };
  
  console.log(msg);
  
  var light = new TPLSmartDevice('192.168.0.104');
  light.send(msg);


//  var scan = TPLSmartDevice.scan()
//    .on('light', light => {
//    light.send(msg)
//  });
});

app.listen(80, '192.168.0.109', function () {
  console.log('Example app listening on port 3000!');
});