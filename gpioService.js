'use strict';

import onoff from 'onoff';
import client from './mqttClient.js';

const Gpio = onoff.Gpio;
const led = new Gpio(4, 'out');
const button = new Gpio(17, 'in', 'rising', {debounceTimeout: 10});

await client.connect();

await client.subscribe("virtualButtonPush", async function (json) {
  // { "pushedState": true }
  await setLedState(json.pushedState);
});

button.watch(async (err, value) => {
  if (err) {
    throw err;
  }

  let isOn = ((led.readSync() ^ 1) === 1);

  await setLedState(isOn);
});

process.on('SIGINT', _ => {
  led.unexport();
  button.unexport();
});

const getLedState = () => {
    return led.readSync();
}

//Pass in true or false
const setLedState = async (isOn) => {
    let bit = 0;
    let txt = "off";

    if(isOn){
        bit = 1;
        txt = "on";
    }

    led.writeSync(bit);

    var msg = "Led is " + txt;

    console.log(msg); //Future will be event

    await client.connect();

    await client.publish(msg)
    .then(
      async (completed) => {
//        await publisher.disconnect();
//	console.log('Published');
    },
    (rejected) => {
      console.log("Rejected error: " + rejected);
    })
    .catch((error) => {
      console.log("Session error: " + error);

      exit(-1);
    });
}

export default {
    getLedState,
    setLedState
}
