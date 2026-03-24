console.warn('Started JS');

//templates
const camtemplate = document.getElementById("camera-template");
const vidtemplate = document.getElementById("video-template");

// =========================
// ✅ SNAPSHOT SCHEDULER (NEW)
// =========================
const MAX_CONCURRENT_SNAPSHOTS = 2;
let activeRequests = 0;
const snapshotQueue = [];

function enqueueSnapshot(task) {
    snapshotQueue.push(task);
    processQueue();
}

function processQueue() {
    if (activeRequests >= MAX_CONCURRENT_SNAPSHOTS) return;
    if (snapshotQueue.length === 0) return;

    const task = snapshotQueue.shift();
    activeRequests++;

    task().finally(() => {
        activeRequests--;
        processQueue();
    });
}

// =========================
// ✅ SNAPSHOT CONTROLLER (NEW)
// =========================
function startSnapshots(img, camId) {
    let stopped = false;
    let timer = null;

    function schedule() {
        if (stopped || document.hidden) return;

        enqueueSnapshot(async () => {
            img.src = `/camera/snapshot/${camId}?t=${Date.now()}`;
        });

        timer = setTimeout(schedule, 2000 + Math.random() * 500);
    }

    function start() {
        if (!timer && !stopped) {
            schedule();
        }
    }

    function stop() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            console.warn(`Tab hidden → stopping snapshots for ${camId}`);
            stop();
        } else {
            console.warn(`Tab visible → restarting snapshots for ${camId}`);
            start();
        }
    });

    start();

    return { stop };
}

// =========================
// ORIGINAL CODE
// =========================

let camera_list = [];

// which cameras are defined
camera_list = await getCameraList();

// Create a row for each
camera_list.forEach(cameraId => {
    createDisplayItem(cameraId);
});

//Get a list of all camera elements
let cameraItems = document.querySelectorAll('.camera-container');

// Update each camera item with the latest data
function update_cameras () {
    cameraItems.forEach(item => {
        const camId = item.dataset.cameraId;
        console.warn('camid to update' + camId)
        updateDisplayItem(item,camId);
    });
    //setTimeout(update_cameras, 5000);
}

//update_cameras();

function createDisplayItem(camId) {
    // First Column
    const camfrag = camtemplate.content.cloneNode(true);
    const cam = camfrag.firstElementChild;
    cam.setAttribute("data-camera-id", camId);

    const button = cam.querySelector("button");
    button.addEventListener("click", () => {
        alert("Button clicked!");
    });

    grid.appendChild(cam);

    // Second Column
    const vidfrag = vidtemplate.content.cloneNode(true);
    const vid = vidfrag.firstElementChild;
    const img = vid.querySelector("img");

    vid.setAttribute("data-camera-id", camId);

    // ✅ NEW SNAPSHOT SYSTEM
    startSnapshots(img, camId);

    grid.appendChild(vid);
}

// No Camera Modal
const modal = document.getElementById("noCamera");
const closeBtn = document.getElementById("closeModal");

if ( camera_list.length == 0 ){
    console.warn('Empty camera_list');
    modal.style.display = "block";
}

closeBtn.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
};


// Functions

function getCameraList() {
    return fetch('/index/cameralist', {
        method: 'GET',
    })
    .then(response => {
        if (!response.ok) {
            console.warn(`Failed to fetch camera list`);
        }
        return response.json();
    })
    .then(data => {
      return data.camera_list;
    })
    .catch(error => {
        console.error("Error fetching camera list:", error);
        return [];
    });
}


function updateDisplayItem(item ,cameraUUID) {
    console.warn('Fetching data for camera:', cameraUUID);
    fetch(`/camera/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camera_uuid: cameraUUID })
    })
    .then(response => {
        if (!response.ok) {
            console.warn(`Failed to fetch data for camera ${cameraUUID}. Status: ${response.status} ${response.statusText}`);
            return response.json().then(errData => {
                throw new Error(`Failed to fetch data for camera ${cameraUUID}: ${errData.detail || response.statusText}`);
            }).catch(() => {
                throw new Error(`Failed to fetch data for camera ${cameraUUID}: ${response.statusText}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.warn(data);
        const camData = {
            camera_uuid: cameraUUID,
            nickname: data.nickname,
            last_result: data.last_result,
            last_time: data.last_time,
            live_detection_running: data.live_detection_running,
            countdown_time: data.countdown_time,
            countdown_action: data.countdown_action
        };
        console.warn('calling update for ' +camData.nickname);
        updateCameraDisplay(item,camData);
    })
    .catch(error => {
        console.error(`Error fetching metrics for camera ${cameraUUID}:`, error.message);
        const emptyData = {
            camera_uuid: cameraUUID,
            nickname: 'Not Configured',
            last_result: '----',
            last_time: 0,
            live_detection_running: '----',
            countdown_time: 0,
            countdown_action: 'Unknown'
        };
        return emptyData;
    });
}


function updateCameraDisplay(item, d) {
    console.warn('updating for ' + d.nickname);

    const camNick = item.querySelector('.nickname');
    camNick.textContent = d.nickname;

    const camPred = item.querySelector('.camera-prediction');

    camPred.textContent = d.last_result;
    camPred.style.color = d.last_result === 'success' ? 'green' : 'red';

    const camAction = item.querySelector('.countdown-action');
    let lastAction = camAction.textContent;
    let action = 'Unknown';

    if (typeof  d.countdown_action === 'undefined'){
        action = lastAction;
    } else {
        console.warn(d.countdown_action);
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

    item.querySelector('.lastTimeValue').textContent = d.last_time ? new Date(d.last_time * 1000).toLocaleTimeString() : '-';

    let statusIndicator = item.querySelector('.camera-status');
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
}

//SRS If active - this is where its tracked

document.addEventListener('cameraStateUpdated', evt => {
    console.warn('camera state updated');
    console.warn(evt.detail.camera_uuid)

    cameraItems.forEach(item => {
        const camId = item.dataset.cameraId; // data-camera-id ==> dataset.cameraId camelCase
        if (evt.detail.camera_uuid == camId){
        updateDisplayItem(item,camId);
        }
    });
});


// Check
window.onload = function() {
    console.warn('on load triggered');

};
