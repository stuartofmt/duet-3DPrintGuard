const cameraTitle = document.getElementById('cameraTitle');
const camDetectionLiveIndicator = document.getElementsByClassName('live-indicator');
const camVideoPreview = document.getElementById('videoPreview');
const cameraItems = document.querySelectorAll('.camera-item');

const stopDetectionBtnLabel = 'Stop Detection';
const startDetectionBtnLabel = 'Start Detection';

//Effectively a global - let scope
let cameraUUID = 0;

function changeLiveCameraFeed(cameraUUID) {
    camVideoPreview.src = `/camera/feed/${cameraUUID}`;
}

function updateCameraTitle(nickname) {
    const titleText = nickname ? nickname : 'No camera selected';
    cameraTitle.textContent = titleText;
}

function toggleIsDetectingStatus(isActive) {
    if (isActive) {
        camDetectionLiveIndicator[0].textContent = `active`;
        camDetectionLiveIndicator[0].style.color = '#2ecc40';
    } else {
        camDetectionLiveIndicator[0].textContent = `inactive`;
        camDetectionLiveIndicator[0].style.color = '#b2b2b2';
    }
}


function updateCameraSelectionListData(d) {
    cameraItems.forEach(item => {
        const cameraId = item.dataset.cameraId;
        if (cameraId == d.camera_uuid) {
            const camPred = item.querySelector('.camera-prediction');
            // console.warn('last result' + d.last_result);
            camPred.textContent = d.last_result;
            camPred.style.color = d.last_result === 'success' ? 'green' : 'red';

            const camAction = item.querySelector('.countdown-action');
            let lastAction = camAction.textContent;
            let action = 'Unknown';
            // A fudge because update packet does not include countdown_action
            // Need to get back to this in later version
            if (typeof  d.countdown_action === 'undefined'){
                action = lastAction;
            } else {
                //console.warn(d.countdown_action);
            }

            if (d.countdown_action === 'dismiss'){
                action = 'DISMISS';
                camAction.style.color = 'green';
            }
            if (d.countdown_action === 'cancel_print'){
                action = 'CANCEL';
                camAction.style.color = 'red';
            }
            if (d.countdown_action === 'pause_print'){
                action = 'PAUSE';
                camAction.style.color = 'orange';
            }
            camAction.textContent = action;
           

            item.querySelector('#lastTimeValue').textContent = d.last_time ? new Date(d.last_time * 1000).toLocaleTimeString() : '-';
            
            let statusIndicator = item.querySelector('.camera-status');
            // console.warn('last status' + statusIndicator.textContent);
            if (d.live_detection_running) {
                statusIndicator.textContent = `Detecting`;
                statusIndicator.style.color = '#2ecc40';
                statusIndicator.style.backgroundColor = 'transparent';
            } else {
                statusIndicator.textContent = `Inactive`;
                statusIndicator.style.color = '#f30606';
                statusIndicator.style.backgroundColor = 'transparent';
                camPred.textContent = '----';
            }
            /*SRS
            Added toggle here to support multiple browser instances correctly updating
            */
            toggleIsDetectingStatus(d.live_detection_running);
            item.querySelector('#cameraPreview').src = `/camera/feed/${d.camera_uuid}`;
        }
    });
}

function updatePolledDetectionData(d) {
    updateCameraSelectionListData(d);
}


function fetchAndUpdateMetricsForCamera(cameraUUID) {
    console.warn('Fetching metrics for camera:', cameraUUID);
    if (!cameraUUID) {
        console.warn('Cannot fetch metrics: invalid camera UUID provided:', cameraUUID);
        return;
    }
    fetch(`/camera/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camera_uuid: cameraUUID })
    })
    .then(response => {
        if (!response.ok) {
            console.warn(`Failed to fetch camera state for camera ${cameraUUID}. Status: ${response.status} ${response.statusText}`);   
            return response.json().then(errData => {
                throw new Error(`Failed to fetch camera state for camera ${cameraUUID}: ${errData.detail || response.statusText}`);
            }).catch(() => {
                throw new Error(`Failed to fetch camera state for camera ${cameraUUID}: ${response.statusText}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.warn('Setting metricsData: Last update time ==>', data.last_time);
        const metricsData = {
            camera_uuid: cameraUUID,
            start_time: data.start_time,
            last_result: data.last_result,
            last_time: data.last_time,
            total_detections: data.detection_times ? data.detection_times.length : 0,
            frame_rate: data.frame_rate,
            live_detection_running: data.live_detection_running,
            brightness: data.brightness,
            contrast: data.contrast,
            focus: data.focus,
            sensitivity: data.sensitivity,
            countdown_time: data.countdown_time,
            majority_vote_threshold: data.majority_vote_threshold,
            majority_vote_window: data.majority_vote_window,
            printer_id: data.printer_id,
            printer_config: data.printer_config,
            countdown_action: data.countdown_action
        };
        updatePolledDetectionData(metricsData);
    })
    .catch(error => {
        console.error(`Error fetching metrics for camera ${cameraUUID}:`, error.message);
        const emptyMetrics = {
            camera_uuid: cameraUUID,
            start_time: null,
            last_result: 'Disconnected',
            last_time: null,
            total_detections: 0,
            frame_rate: null,
            live_detection_running: false
        };
        updatePolledDetectionData(emptyMetrics);
    });
}

function sendDetectionRequest(isStart) {
    if (cameraUUID === null || cameraUUID === undefined) {
        console.warn(`Cannot ${isStart ? 'start' : 'stop'} detection: no valid camera selected`);
        return;
    }
    fetch(`/detect/live/${isStart ? 'start' : 'stop'}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ camera_uuid: cameraUUID })
    })
    .then(response => {
        if (response.ok) {
            //console.warn('Got detection response' + cameraUUID)
            fetchAndUpdateMetricsForCamera(cameraUUID);
        } else {
            response.json().then(errData => {
                console.error(`Failed to ${isStart ? 'start' : 'stop'} live detection for camera ${cameraUUID}. Server: ${errData.detail || response.statusText}`);
            }).catch(() => {
                console.error(`Failed to ${isStart ? 'start' : 'stop'} live detection for camera ${cameraUUID}. Status: ${response.status} ${response.statusText}`);
            });
        }
    })
    .catch(error => {
        console.error(`Network error or exception during ${isStart ? 'start' : 'stop'} request for camera ${cameraUUID}:`, error);
    });
}

cameraItems.forEach(item => {
    item.addEventListener('click', function() {
        console.warn('Camera item clicked:', this.dataset.cameraId);
        cameraItems.forEach(i => i.classList.remove('selected'));
        this.classList.add('selected');
        const cameraId = this.dataset.cameraId;
        if (cameraId) {
            const nickname = this.querySelector('.camera-header span:first-child').textContent;         
            changeLiveCameraFeed(cameraId);
            cameraUUID = cameraId;
            updateCameraTitle(nickname);
            fetchAndUpdateMetricsForCamera(cameraId);
        } else {
            console.warn('No camera ID found for selected item');
            cameraUUID = null;
            updateCameraTitle(null);
        }
    });


    const startstopcameraButton = item.querySelector('.start-stop-camera-btn');
    update_start_stop_button_UI(startstopcameraButton, !(item.dataset.isLive.toLowerCase() === 'true'));

    startstopcameraButton.addEventListener('click', function(event) {
        event.stopPropagation();
        const cameraId = item.dataset.cameraId;
        let statusIndicator = item.querySelector('.camera-status');
        let indicator = statusIndicator.textContent
        let isLive = true;
        if (indicator == `Detecting`) {
            isLive = true;
        } else if (indicator == `Inactive`) {
            isLive = false;
        }
        
        /*SRS
        Assignment here to ensure correct camera is targeted
        */
        cameraUUID = cameraId;
        /*SRS
        Added toggle here to support individual control in UI
        */
        update_start_stop_button_UI(startstopcameraButton,isLive);
        if (isLive) {
            sendDetectionRequest(false);
            toggleIsDetectingStatus(false);
         } else {
            sendDetectionRequest(true);
            toggleIsDetectingStatus(true);
        }

    });
});


function update_start_stop_button_UI(startstopcameraButton, isLive) {
    // logic looks reversed since this is based on immediate prior status
    if (isLive) {
        startstopcameraButton.textContent = startDetectionBtnLabel;
        startstopcameraButton.style.backgroundColor = 'green';
    } else {

        startstopcameraButton.textContent = stopDetectionBtnLabel;
        startstopcameraButton.style.backgroundColor = 'red';
    }
}

//SRS If active - this is where its tracked
document.addEventListener('cameraStateUpdated', evt => {
    if (evt.detail) {
        updatePolledDetectionData(evt.detail);
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // Click each of the cameras to update displays
    let counter = 0;
    while(counter < (Object.keys(cameraItems).length)){
        const camera = cameraItems[counter]
        if (camera){
            cameraItems[counter].click();
        }
        counter ++;
    }
    // Go back to the first camera
    const firstCameraItem = cameraItems[0];
    if (firstCameraItem) {
        const cameraId = firstCameraItem.dataset.cameraId;
        if (cameraId) {
            firstCameraItem.click();
        }
    }
});
