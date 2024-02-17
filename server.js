const WebS = require('ws');
const mqtt = require('mqtt');
const webSocketServer = new WebS.Server({ port: 3000 });
let arr = ['/devices/wb-mdm3_140/controls/K1',
    '/devices/wb-mdm3_140/controls/K2',
    '/devices/wb-mdm3_140/controls/K3',
    '/devices/wb-mr6c_237/controls/K1',
    '/devices/wb-mr6c_237/controls/K2',
    '/devices/wb-mr6c_237/controls/K3',
    '/devices/wb-mr6c_237/controls/K4',
    '/devices/wb-mr6c_237/controls/K5',
    '/devices/wb-mr6c_237/controls/K6',
    '/devices/wb-mdm3_140/controls/Channel 1',
    '/devices/wb-mdm3_140/controls/Channel 2',
    '/devices/wb-mdm3_140/controls/Channel 3'
]

const client = mqtt.connect('mqtt://192.168.0.107:1883');

client.on('connect', function () {

    client.subscribe(arr);
});

//webSocketServer.listen(3000, () => console.log("Server started"))

let arrConn = []

client.on('message', (topic, message) => {
    let event = topic + ' - ' + message.toString();
    console.log(event);
    arrConn.forEach(conn => {
        conn.send(event)
    })
});

webSocketServer.on('connection', webSocketConnection => {
    arrConn.push(webSocketConnection)
})



function mqttFunc(topic, value) {
    const client2 = mqtt.connect('mqtt://192.168.0.107:1883');
    client2.on('connect', () => {

        client2.subscribe(topic);

    })

    client2.on('message', () => {
        console.log(topic + 'and' + value);
        client2.publish(topic + '/on', String(value));

        client2.end();

    });

}

webSocketServer.on('connection', ws => {
    ws.on('message', message => {
        webSocketServer.clients.forEach(client => {
            if (client.readyState === WebS.OPEN) {
                let value = (Buffer.from(message)).toString();
                let arr = value.split(',');
                arr[1] = JSON.parse(arr[1]);
                arr[1] = Number(!arr[1]);
                let obj = {
                    topic: arr[0],
                    value: arr[1]
                };

                console.log(arr[0]);

                mqttFunc(arr[0], arr[1])



            }
        });
    });
    ws.send('Добро пожаловать на сервер');
});