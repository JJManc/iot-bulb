'use strict';

import iotsdk from 'aws-iot-device-sdk-v2';
import { exit } from 'process';
import awscrt from 'aws-crt';

//Short names
const mqtt = iotsdk.mqtt;
const http = awscrt.http;
const io = awscrt.io;
const iot = awscrt.iot;
const decoder = new TextDecoder('utf8');
var connection;
var _argv;
var _onReceived;

//Future pass in argsv
intialize();
 
function intialize() {
    //Hard coded FOR NOW must pass in later from the right place (where is the right place?)
    let argv = {};
    
    // Defaults
    argv.client_id = "";
    argv.is_ci = false;
    argv.proxy_host = "";
    argv.proxy_port = 8080;
    argv.verbosity = "none";
    
    //Hard coded
    argv.topic = "topic_1";
    argv.ca_file = "/home/juanjmncpi/certs/AmazonRootCA1.pem";
    argv.cert = "/home/juanjmncpi/certs/certificate.pem.crt";
    argv.key = "/home/juanjmncpi/certs/private.pem.key";
    argv.endpoint = "a1h48leiuhv81f-ats.iot.us-east-1.amazonaws.com";

    if (argv.verbosity != 'none') {
        const level = parseInt(io.LogLevel[argv.verbosity.toUpperCase()]);
        io.enable_logging(level);
    }

    _argv = argv;
}

 //Make sure to change the port
 //In the future must expose/export main
 async function connect() {
    connection = buildConnection(_argv); 
    
    await connection
        .connect()
        .catch((error) => {
            console.log("Connect error: " + error);
            
            exit(-1)
        });
}

//When do we disconnect? Disconnect when the process stops?
//Can I lose my connection?
async function disconnect() {
    await connection
        .disconnect()
        .catch((error) => {
            console.log("Disconnect error: " + error);
            
            exit(-1)
        });
}

async function publish(msg) {
     return new Promise(async (resolve, reject) => {
         try {
            const json = JSON.stringify(msg);
            
            connection
                .publish(_argv.topic, json, mqtt.QoS.AtLeastOnce)
                .then(resolve());
         }
         catch (error) {
             reject(error);
         }
     });
 }

const onReceivedInternal = async (topic, payload, dup, qos, retain) => {
    const json = decoder.decode(payload);
    
    if(_onReceived) {
        _onReceived(json);
    }

    console.log(json);
    
    resolve();
}

async function subscribe(topic, onReceived) {
    await connection.subscribe(topic, mqtt.QoS.AtLeastOnce, onReceivedInternal);

    _onReceived = onReceived;
}

function buildConnection(argv) {
    let config_builder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(argv.cert, argv.key);

    if (argv.proxy_host) {
        config_builder.with_http_proxy_options(new http.HttpProxyOptions(argv.proxy_host, argv.proxy_port));
    }

    if (argv.ca_file != null) {
        config_builder.with_certificate_authority_from_path(undefined, argv.ca_file);
    }

    config_builder.with_clean_session(false);
    config_builder.with_client_id(argv.client_id || "test-" + Math.floor(Math.random() * 100000000));
    config_builder.with_endpoint(argv.endpoint);
    
    const config = config_builder.build();
    const client = new awscrt.mqtt.MqttClient();

    return client.new_connection(config);
}

export default {
    connect,
    publish,
    subscribe,
    disconnect
}
