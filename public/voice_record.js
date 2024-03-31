// import * as FFmpeg from '@ffmpeg/ffmpeg';
if (navigator.mediaDevices) {
    console.log("supported");
}

// const url = "http://localhost:5500/Home";

navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        let voice = [];

        document.querySelector(".start").addEventListener("click", () => {
            mediaRecorder.start();
            console.log('start');
        })

        mediaRecorder.addEventListener("dataavailable", event => {
            voice.push(event.data);
        })

        document.querySelector(".finish").addEventListener("click", () => {
            mediaRecorder.stop();
            console.log('finish');
        })

        mediaRecorder.addEventListener("stop", async () => {
            // const voiceBlob = new Blob(voice, { type: 'audio/wav' });
            async function convertWebmToMp3(webmBlob) {
                const ffmpeg = createFFmpeg({ log: false });
                await ffmpeg.load();

                const inputName = 'input.webm';
                const outputName = 'output.wav';

                ffmpeg.FS('writeFile', inputName, await fetch(webmBlob).then((res) => res.arrayBuffer()));

                await ffmpeg.run('-i', inputName, outputName);

                const outputData = ffmpeg.FS('readFile', outputName);
                const outputBlob = new Blob([outputData.buffer], { type: 'audio/wav' });

                return outputBlob;
            }

            let voiceBlob = convertWebmToMp3(voice);
            // let link = document.createElement('a');

            // const blobToFile = (blop, filename) => new File([blop], filename, {
            //     type: 'audio/wav',
            //     lastModified: new Date()
            // });

            // const file = blobToFile(voiceBlob, "soundNikonov.wav");
            // link.setAttribute('href', URL.createObjectURL(voiceBlob));
            // link.setAttribute('download', 'soundNikonov');
            // link.click();
            // console.log(file);
            let fd = new FormData();
            fd.append('title', 'voice');
            fd.append('file', voiceBlob);

            fetch("http://localhost:8081/recognize", {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: fd
            })
                .then(res => {
                    if (!res.ok) {
                        console.log('error');
                    }
                    return res.text();
                })
                .then(data => {
                    console.log(data);
                })
                .catch(error => console.log(error));

        })
    });




