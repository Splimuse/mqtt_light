const WebS = require('ws');
const mqtt = require('mqtt');
const webSocketServer = new WebS.Server({ port: 3000 });
let arr = [
    '/devices/wb-mdm3_140/controls/K1',
    '/devices/wb-mdm3_140/controls/K2',
    '/devices/wb-mdm3_140/controls/K3',
    '/devices/wb-mr6c_237/controls/K1',
    '/devices/wb-mr6c_237/controls/K2',
    '/devices/wb-mr6c_237/controls/K3',
    '/devices/wb-mr6c_237/controls/K4',
    '/devices/wb-mr6c_237/controls/K5',
    '/devices/wb-mr6c_237/controls/K6',
    // '/devices/wb-mdm3_140/controls/Channel 1',
    // '/devices/wb-mdm3_140/controls/Channel 2',
    // '/devices/wb-mdm3_140/controls/Channel 3',
]

let state = new Map([
    ['/devices/wb-mdm3_140/controls/K1', 0],
    ['/devices/wb-mdm3_140/controls/K2', 0],
    ['/devices/wb-mdm3_140/controls/K3', 0],
    ['/devices/wb-mr6c_237/controls/K1', 0],
    ['/devices/wb-mr6c_237/controls/K2', 0],
    ['/devices/wb-mr6c_237/controls/K3', 0],
    ['/devices/wb-mr6c_237/controls/K4', 0],
    ['/devices/wb-mr6c_237/controls/K5', 0],
    ['/devices/wb-mr6c_237/controls/K6', 0],
    // ['/devices/wb-mdm3_140/controls/Channel 1', 0],
    // ['/devices/wb-mdm3_140/controls/Channel 2', 0],
    // ['/devices/wb-mdm3_140/controls/Channel 3', 0],
])

const ipAddr = "192.168.0.109"

const mqttClient = mqtt.connect(`mqtt://${ipAddr}:1883`);

mqttClient.on('connect', function () {
    console.log("mqtt connection established")
    mqttClient.subscribe(arr);
});

let arrConn = []

mqttClient.on('message', (topic, message) => {
    let event = topic + ' - ' + message.toString();
    console.log(`mqtt event ${event}`);
    state.set(topic, message)
    arrConn.forEach(conn => {
        conn.send(event)
    })
});

webSocketServer.on('connection', webSocketConnection => {
    console.log(`client ${webSocketConnection} connected`)
    arrConn.push(webSocketConnection)
    state.forEach((value, key) => {
        let stateEvent = key + ' - ' + value.toString();
        console.log(`state event: ${stateEvent}`)
        webSocketConnection.send(stateEvent)
    })

    webSocketConnection.on('message', message => {
        let value = (Buffer.from(message)).toString();
        let arr = value.split(',');
        arr[1] = JSON.parse(arr[1]);
        arr[1] = Number(!arr[1]);

        mqttWrite(arr[0], arr[1])
    });
})

function mqttWrite(topic, value) {
    console.log(topic + ' and ' + value);
    mqttClient.publish(topic + '/on', String(value));

}
