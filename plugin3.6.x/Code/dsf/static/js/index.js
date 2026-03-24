console.warn("NEW GRID LAYOUT ACTIVE");

// =========================
// Templates
// =========================
const camTemplate = document.getElementById("camera-template");
const vidTemplate = document.getElementById("video-template");
const btnTemplate = document.getElementById("button-template");
const grid = document.getElementById("grid");

// =========================
// Globals
// =========================
 let cameraItems

// =========================
// Snapshot Queue
// =========================
const MAX_CONCURRENT_SNAPSHOTS = 2;

let activeRequests = 0;
const queue = [];

function enqueue(task) {
  queue.push(task);
  processQueue();
}

function processQueue() {
  if (activeRequests >= MAX_CONCURRENT_SNAPSHOTS || queue.length === 0) return;

  const task = queue.shift();
  activeRequests++;

  task().finally(() => {
    activeRequests--;
    processQueue();
  });
}

// =========================
// Snapshot Loop
// =========================
function startSnapshots(img, camId) {
  function loop() {
    if (document.hidden) return;

    enqueue(async () => {
      img.src = `/camera/snapshot/${camId}?t=${Date.now()}`;
    });

    setTimeout(loop, 2000 + Math.random() * 500);
  }

  loop();
}

// =========================
// Create UI (FIXED)
// =========================
function createTopRowButtons(){
  const row = document.createElement("div");
  row.className = "button-row";
  const btnFrag = btnTemplate.content.cloneNode(true);
  const btn = btnFrag.firstElementChild;

  const ignoreBtn = btn.querySelector(".btn-ignore");
  const pauseBtn = btn.querySelector(".btn-pause");
  const cancelBtn = btn.querySelector(".btn-cancel");

  // Event for Ignore button
  ignoreBtn.addEventListener("click", () => {
    alert("Ignore button clicked");
    // Add your Ignore logic here
  });

  // Event for Pause button
  pauseBtn.addEventListener("click", () => {
    alert("Pause button clicked");
    // Add your Pause logic here
  });

  // Event for Cancel button
  cancelBtn.addEventListener("click", () => {
    alert("Cancel button clicked");
    // Add your Cancel logic here
  });

  row.appendChild(btn);
  grid.appendChild(row);

}

function createDisplayItem(camId) {
  // Wrapper (CRITICAL)
  const row = document.createElement("div");
  row.className = "camera-row";

  // Card
  const camFrag = camTemplate.content.cloneNode(true);
  const card = camFrag.firstElementChild;
  card.dataset.cameraId = camId;

  // Button
  const button = card.querySelector("button");
  button.addEventListener("click", () => {
    alert(`Camera ${camId} button clicked`);
  });

  // Video
  const vidFrag = vidTemplate.content.cloneNode(true);
  const video = vidFrag.firstElementChild;
  const img = video.querySelector("img");

  video.dataset.cameraId = camId;

  startSnapshots(img, camId);

  // Assemble
  row.appendChild(card);
  row.appendChild(video);

  grid.appendChild(row);
}

// =========================
// API
// =========================
async function getCameraList() {
  try {
    const res = await fetch("/index/cameralist");
    if (!res.ok) return [];
    const data = await res.json();
    return data.camera_list || [];
  } catch {
    return [];
  }
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

    //const camPred = item.querySelector('.camera-prediction');
    const camPred = item.querySelector(".camera-prediction .prediction-value");
    
    camPred.textContent = d.last_result;
    camPred.style.color = d.last_result === 'success' ? 'green' : 'red';

    const camAction = item.querySelector('.countdown-action .action-value');
    //const camAction = item.querySelector('.countdown-action');
    /*
    let lastAction = camAction.textContent;
    let action = 'Unknown';
    */
  console.warn('checkpoint');
   let action = d.countdown_action;
     console.warn('checkpoint ' + action);
    if (action === 'dismiss') {
        action = 'DISMISS';
        camAction.style.color = 'green';
    } else if (action === 'cancel_print'){
        action = 'CANCEL';
        camAction.style.color = 'red';
    } else if (action === 'pause_print'){
        action = 'PAUSE';
        camAction.style.color = 'orange';
    } else {
        action = 'UNKNOWN';
        camAction.style.color = 'green';
    }

    camAction.textContent = action;

    //item.querySelector('.lastTimeValue').textContent = d.last_time ? new Date(d.last_time * 1000).toLocaleTimeString() : '-';
    item.querySelector(".last-update .update-value").textContent = d.last_time ? new Date(d.last_time * 1000).toLocaleTimeString() : '-';

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



// =========================
// Init
// =========================
(async function init() {
  console.warn('Initializing');

  const cameras = await getCameraList();

  if (cameras.length === 0) {
    document.getElementById("noCamera").style.display = "block";
  }

  //create top row of buttons
  createTopRowButtons();
  //crerate a row for each camera
  cameras.forEach(createDisplayItem);



//Get a list of all camera rows
  cameraItems = document.querySelectorAll('.camera-card');
  console.warn(cameraItems);

  cameraItems.forEach(item => {
      const camId = item.dataset.cameraId;
      console.warn('camid to update ' + camId)
      updateDisplayItem(item,camId);
  });
})();

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.warn('DOM loaded');
});