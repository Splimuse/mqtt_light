const button = document.querySelectorAll('button');

const ws = new WebSocket('ws://localhost:3000');

function setStatus(value) {
    console.log(value);
}



button.forEach(function (btn) {
    btn.addEventListener('click', event => {

        console.log(btn.id);

        ws.send([btn.id, btn.value]);

    });

})

ws.onopen = () => setStatus('ONLINE');

ws.onclose = () => setStatus('DISCONNECTED');

ws.onmessage = (msg) => {
    let res = msg.data.split(' - ');
    console.log(`message recv ${res}`);

    document.getElementById(res[0]).value = res[1];
    document.getElementById(res[0]).textContent = res[1];
    if (Number(res[1]) == 0) {
        document.getElementById(res[0]).style.backgroundColor = "silver";
    } else {
        document.getElementById(res[0]).style.backgroundColor = "yellow";
    }
    console.log(res);

};