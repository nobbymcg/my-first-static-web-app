// Spoof detection code

function handleFile() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            // Need to add row to the audioTable
            console.log('Spoof detection from file');
            const audioUrl = URL.createObjectURL(file);
            updateAudioTable(audioUrl, 'N/A', 'Spoof');
            // Now send the file to the middleware
            const blob = new Blob([event.target.result], { type: file.type });
            if (spoofCheckWithMiddleware(blob, gkResultCounter++) == 'ERROR') {
                console.log("Failed to connect...");
            }
        };

        reader.readAsArrayBuffer(file);
    }
}

function spoofCheckWithMiddleware(blob, resultCounter) {

    var request = new XMLHttpRequest();
    const speakerID = document.getElementById('speakerID').value;
    // request.open("POST", "http://localhost:8080/verify/"+speakerID+"/TI");

    processingState = true;
    isPulsing = true;
    resetVisualisation();
    
    pulseLogo();

    request.open("POST", "https://gkmware.azurewebsites.net/api/SpoofCheck");
    // Add the an authorizartion header to the request of the for Bearer <API Key>
    request.setRequestHeader("Authorization", "Bearer " + unmaskedAPIKey);
    
    request.send(blob);
    var response = '';

    request.onload = function() {
        let imageHolder = document.getElementById('gkResultImage' + resultCounter);
        // Stop the animation by changing class of the image from gkResultWaiting to gkResultImage
        imageHolder.className = 'gkResultImage';
        processingState = false;
        if (request.status == 200) {
            console.log("Middleware returned 200");
            console.log(request.response);

            // Get the top table row
            const tableRow = document.getElementById('audioTableBody').rows[0];

            var jsonResponse = JSON.parse(request.response);
            var displayText = '';
            var reason = '';
            var risk = 0;
            console.log(jsonResponse);
            response = jsonResponse.result;

            // Parse the response and update the UI
            if (response == 'OK' && typeof(jsonResponse.channelPlaybackDetectionResult) != 'undefined') {
                // Check Synthetic result first
                // DECISION_NO_RISK_DETECTED
                // DECISION_FRAUD
                // DECISION_UNCERTAIN
                // check if jsonResponse.syntheticSpeechDetectionResult is undefined
                const synthResponse = jsonResponse.syntheticSpeechDetectionResult;
                if (synthResponse.decision == 'DECISION_NO_RISK_DETECTED') {
                    // SSD check is ok so now check the playback result
                    // DECISION_REASON_PLAYBACK_INDICATION
                    // DECISION_NO_RISK_DETECTED
                    // DECISION_UNCERTAIN
                    console.log('Synthetic Speech Detection OK');
                    console.log("Now checking playback");
                    const playbackResponse = jsonResponse.channelPlaybackDetectionResult;
                    if (playbackResponse.decision == 'DECISION_NO_RISK_DETECTED') {
                        imageHolder.src = 'images/good_audio.svg';
                        displayText = 'Audi Ok';
                        reason = playbackResponse.reason;
                        risk = playbackResponse.result.risk;
                    } else if (playbackResponse.decision == 'DECISION_FRAUD') {
                        imageHolder.src = 'images/speaker.svg';
                        displayText = 'Playback Detected';
                        reason = playbackResponse.reason;
                        risk = playbackResponse.result.risk;
                    } else if (playbackResponse.decision == 'DECISION_UNCERTAIN') {
                        imageHolder.src = 'images/audio_uncertain.svg';
                        displayText = 'Uncertain';
                        reason = playbackResponse.reason;
                        risk = playbackResponse.result.risk;
                    } else {
                        imageHolder.src = 'images/gatekeeper_error.svg';
                        displayText = 'Error';
                        reason = playbackResponse.reason;
                        risk = 'N/A';
                    }
                } else if (synthResponse.decision == 'DECISION_FRAUD') {
                    imageHolder.src = 'images/Deepfake.svg';
                    displayText = 'Synthetic Attack';
                    reason = synthResponse.reason;
                    risk = synthResponse.result.risk;
                } else if (synthResponse.decision == 'DECISION_UNCERTAIN') {
                    imageHolder.src = 'images/gatekeeper_grey.svg';
                    displayText = 'Uncertain';
                    reason = synthResponse.reason;
                    risk = synthResponse.result.risk;
                } else {
                    imageHolder.src = 'images/gatekeeper_error.svg';
                    displayText = 'Error';
                    reason = synthResponse.reason;
                    risk = 'N/A';
                }
            } else {
                imageHolder.src = 'images/gatekeeper_error.svg';
                displayText = 'Error';
                reason = 'Check audio quality';
                risk = 'N/A';
            }

            imageHolder.width = 30;
            imageHolder.title = reason;
            tableRow.cells[5].innerHTML = 'N/A';
            tableRow.cells[6].innerHTML = risk;

            showResults(imageHolder.src, displayText);

        } else {
            console.log("Middleware returned " + request.status);
            console.log(request.response);
            response = request.response;
        }
        // Reset the canvas to show the microphone
        isPulsing = false;
        resetVisualisation();
    };

    request.onerror = function() {
        console.error("An error occurred while making the request to Middleware.");
        let imageHolder = document.getElementById('gkResultImage' + resultCounter);
        // Stop the animation by changing class of the image from gkResultWaiting to gkResultImage
        imageHolder.className = 'gkResultImage';

        // Get the top table row
        const tableRow = document.getElementById('audioTableBody').rows[0];

        processingState = false;
        imageHolder.src = 'images/gatekeeper_error.svg';
        imageHolder.width = 30;
        imageHolder.title = "Failed to connect to middleware";
        tableRow.cells[3].innerHTML = '-';
        tableRow.cells[4].innerHTML = '-';

        // Reset the canvas to show the microphone
        isPulsing = false;
        resetVisualisation();
        return("ERROR");

    };
}