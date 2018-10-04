var TPLSmartDevice = require('tplink-lightbulb');
var express = require('express');
var app = express();
var lights = [];
var zero_count=0;

function getFirstLightInfoPromise() {

  if (lights.length == 0) {
	return null;
  }
  
  var firstLight = lights[0];
  
  return firstLight.info();
  
}

function buildMsg(level, onoff)
{
	return {
      "smartlife.iot.smartbulb.lightingservice": {
        "transition_light_state": {
          "on_off": onoff,
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
  
  var level=parseInt(req.query.value);
  if(level===0) zero_count++;
  else zero_count=0;
  var onoff=1;
  if (zero_count>10) onoff=0; 
  
  var msg = buildMsg(level,onoff);
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
    
    var level=parseInt(req.query.value);
  if(level===0) zero_count++;
  else zero_count=0;
  var onoff=1;
  if (zero_count>10) onoff=0; 
  
  var msg = buildMsg(level,onoff);
  
	console.log('Current brightness: ' + info.light_state.brightness);
	console.log('Decreased brightness: ' + brightness);

	res.send('Decreased brightness to ' + brightness);
	
	//broadcast
	for (var i = 0; i < lights.length; i++) {
		lights[i].send(msg);
    }
	
  });
	  
  
});