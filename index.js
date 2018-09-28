var TPLSmartDevice = require('tplink-lightbulb');
var express = require('express');
var app = express();
var lights = [];

function getFirstLightInfoPromise() {

  if (lights.length == 0) {
	return null;
  }
  
  var firstLight = lights[0];
  
  return firstLight.info();
  
}

function buildMsg(level)
{
	return {
      "smartlife.iot.smartbulb.lightingservice": {
        "transition_light_state": {
          "on_off": 1,
          "transition_period": 1000,
          "brightness": level
        }
      }
    };
}

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/lux', function (req, res){
  res.send('value:' + req.query.value);
  
  var msg = buildMsg( parseInt(req.query.value) );
  console.log(msg);
  //broadcast
  for (var i = 0; i < lights.length; i++) {
    lights[i].send(msg);
  }
  
});

app.listen(80, '192.168.0.109', function () {
  console.log('Example app listening on port 80!');
});

const lightEE = TPLSmartDevice.scan()
  .on('light', light => {
    lights.push(light);
	light.info().then(info => console.log('Found new light: ' + info.alias));
});

app.get('/add', function (req, res){
	
  var infoPromise = getFirstLightInfoPromise();
  
  if (infoPromise == null) {
    res.send('No lights to affect');
	return;
  }
  
  var step = parseInt(req.query.step);
  if (step == undefined)
	step = 1;
  
  infoPromise.then(info => { 
  
    var brightness = info.light_state.brightness + step;
	
	if (brightness > 100)
      brightness = 100;
  
	console.log('Current brightness: ' + info.light_state.brightness);
	console.log('Increased brightness: ' + brightness);

	res.send('Increased brightness to ' + brightness);
	
	//broadcast
	for (var i = 0; i < lights.length; i++) {
		lights[i].send(buildMsg(brightness));
    }
	
  });
	  
  
});

app.get('/sub', function (req, res){
	
  var infoPromise = getFirstLightInfoPromise();
  
  if (infoPromise == null) {
    res.send('No lights to affect');
	return;
  }
  
  var step = parseInt(req.query.step);
  if (step == undefined)
	step = 1;
  
  infoPromise.then(info => { 
  
    var brightness = info.light_state.brightness - step;
	
	if (brightness < 0)
      brightness = 0;
  
	console.log('Current brightness: ' + info.light_state.brightness);
	console.log('Decreased brightness: ' + brightness);

	res.send('Decreased brightness to ' + brightness);
	
	//broadcast
	for (var i = 0; i < lights.length; i++) {
		lights[i].send(buildMsg(brightness));
    }
	
  });
	  
  
});