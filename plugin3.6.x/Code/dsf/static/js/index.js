import { registerPush, unsubscribeFromPush } from './notifications.js';
import { render_ascii_title } from './utils.js';

const camPredictionDisplay = document.getElementById('camPredictionDisplay');
const camPredictionTimeDisplay = document.getElementById('camPredictionTimeDisplay');
const camTotalDetectionsDisplay = document.getElementById('camTotalDetectionsDisplay');
const camFailuresLastWindowDisplay = document.getElementById('camFailuresLastWindowDisplay');
const camDetectionToggleButton = document.getElementById('camDetectionToggleButton');

const stopDetectionBtnLabel = 'Stop Detection';
const startDetectionBtnLabel = 'Start Detection';


function updateRecentDetectionResult(result, doc_element) {
    doc_element.textContent = result || '-';
}

function updateRecentDetectionTime(last_time, doc_element) {
    try {
        if (!last_time) {throw 'exit';}
        const date = new Date(last_time * 1000);
        const timeString = date.toISOString().substr(11, 8);
        doc_element.textContent = timeString;
        return;
    } catch (e) {
        doc_element.textContent = '-';
    }
}

function updateTotalDetectionsCount(detection_times, doc_element) {
    if (!detection_times) {
        doc_element.textContent = '-';
        return;
    }
    doc_element.textContent = detection_times;
}

function updateFailuresLastWindowCount(failure_count, doc_element) {
    if (!failure_count) {
        doc_element.textContent = '0';
        return;
    }
    doc_element.textContent = failure_count;
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

function updateDetectionButton(isActive) {
    if (isActive) {
        camDetectionToggleButton.textContent = stopDetectionBtnLabel;
    } else {
        camDetectionToggleButton.textContent = startDetectionBtnLabel;
    }
}

function updateSelectedCameraSettings(d) {
    settingsCameraUUID.value = d.camera_uuid;
    settingsSensitivityLabel.textContent = d.sensitivity;
    settingsSensitivity.value = d.sensitivity;
    updateSliderFill(settingsSensitivity);
    settingsBrightnessLabel.textContent = d.brightness;
    settingsBrightness.value = d.brightness;
    updateSliderFill(settingsBrightness);
    settingsContrastLabel.textContent = d.contrast;
    settingsContrast.value = d.contrast;
    updateSliderFill(settingsContrast);
    settingsFocusLabel.textContent = d.focus;
    settingsFocus.value = d.focus;
    updateSliderFill(settingsFocus);
    settingsCountdownTimeLabel.textContent = d.countdown_time;
    settingsCountdownTime.value = d.countdown_time;
    updateSliderFill(settingsCountdownTime);
    settingsMajorityVoteThresholdLabel.textContent = d.majority_vote_threshold;
    settingsMajorityVoteThreshold.value = d.majority_vote_threshold;
    updateSliderFill(settingsMajorityVoteThreshold);
    settingsMajorityVoteWindowLabel.textContent = d.majority_vote_window;
    settingsMajorityVoteWindow.value = d.majority_vote_window;
    updateSliderFill(settingsMajorityVoteWindow);
    /*settingsCountdownAction.value = d.countdown_action;*/
    settingsCountdownAction.value = 'dismiss';
    currentCameraPrinterConfig = d.printer_config;
    
    const hasPrinter = d.printer_id !== null && d.printer_id !== undefined;
    for (const option of settingsCountdownAction.options) {
        if (option.value === 'cancel_print' || option.value === 'pause_print') {
            option.disabled = !hasPrinter;
        }
    }
    if (!hasPrinter && (settingsCountdownAction.value === 'cancel_print' || settingsCountdownAction.value === 'pause_print')) {
        settingsCountdownAction.value = 'dismiss';
        saveSetting(settingsCountdownAction);
    }
}

function printerTileStyle(linked) {
    const printerConfigBtn = document.getElementById('printerConfigBtn');
    const linkPrinterBtn = document.getElementById('linkPrinterBtn');
    const printerConfigStatus = document.getElementById('printerConfigStatus');
    if (linked) {
        printerConfigBtn.style.display = 'block';
        linkPrinterBtn.style.display = 'none';
        printerConfigStatus.textContent = `Printer Settings`;
    } else {
        printerConfigBtn.style.display = 'none';
        linkPrinterBtn.style.display = 'block';
    }
}

function updateSelectedCamerasPrinterModal(printerStatus, printerTemperature, printerBedTemperature) {
    const printerStatusLbl = document.getElementById('modalPrinterStatus');
    const printerTemperatureLbl = document.getElementById('modalNozzleTemp');
    const printerBedTemperatureLbl = document.getElementById('modalBedTemp');
    const hasPrinter = currentCameraPrinterConfig !== null && currentCameraPrinterConfig !== undefined;
    printerTileStyle(hasPrinter);
    if (hasPrinter) {
        printerStatusLbl.textContent = printerStatus;
        printerTemperatureLbl.textContent = printerTemperature;
        printerBedTemperatureLbl.textContent = printerBedTemperature;
    }
}

function updateSelectedCameraData(d) {
    updateRecentDetectionResult(d.last_result, camPredictionDisplay);
    updateRecentDetectionTime(d.last_time, camPredictionTimeDisplay);
    updateTotalDetectionsCount(d.total_detections, camTotalDetectionsDisplay);
    updateFailuresLastWindowCount(d.total_failures, camFailuresLastWindowDisplay);
    updateDetectionButton(d.live_detection_running);
}

function updateCameraSelectionListData(d) {
    cameraItems.forEach(item => {
        const cameraId = item.dataset.cameraId;

        if (cameraId == d.camera_uuid) {
            item.querySelector('.camera-prediction').textContent = d.last_result;
            item.querySelector('#lastTimeValue').textContent = d.last_time ? new Date(d.last_time * 1000).toLocaleTimeString() : '-';
            item.querySelector('.camera-prediction').style.color = d.last_result === 'success' ? 'green' : 'red';
            let statusIndicator = item.querySelector('.camera-status');
            if (d.live_detection_running) {
                statusIndicator.textContent = `active`;
                statusIndicator.style.color = '#2ecc40';
                statusIndicator.style.backgroundColor = 'transparent';
            } else {
                statusIndicator.textContent = `inactive`;
                statusIndicator.style.color = '#b2b2b2';
                statusIndicator.style.backgroundColor = 'transparent';
            }
        }
    });
}


function updatePolledDetectionData(d) {
    if ('camera_uuid' in d && d.camera_uuid == cameraUUID) {
        updateSelectedCameraData(d);
    }
    /*updateCameraSelectionListData(d);*/
}

function fetchAndUpdateMetricsForCamera(cameraUUID) {
    fetch(`/camera/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camera_uuid: cameraUUID })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(`Failed to fetch camera state for camera ${cameraUUID}: ${errData.detail || response.statusText}`);
            }).catch(() => {
                throw new Error(`Failed to fetch camera state for camera ${cameraUUID}: ${response.statusText}`);
            });
        }
        return response.json();
    })
    .then(data => {
        const metricsData = {
            camera_uuid: cameraUUID,
            start_time: data.start_time,
            last_result: data.last_result,
            last_time: data.last_time,
            total_detections: data.detection_times ? data.detection_times.length : 0,
            failure_count: data.failure_count ? data.failure_count.length : 0,
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
        /*updateSelectedCameraSettings(metricsData);*/
    })
    .catch(error => {
        console.error(`Error fetching metrics for camera ${cameraUUID}:`, error.message);
        const emptyMetrics = {
            camera_uuid: cameraUUID,
            start_time: null,
            last_result: '-',
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

camDetectionToggleButton.addEventListener('click', function() {
    if (camDetectionToggleButton.textContent === startDetectionBtnLabel) {
        camDetectionToggleButton.textContent = stopDetectionBtnLabel;
        sendDetectionRequest(true);
    } else {
        camDetectionToggleButton.textContent = startDetectionBtnLabel;
        sendDetectionRequest(false);
    }
});


/*const cameraId = "f615bdc5-f42f-4729-9482-c53d6942973f";
const cameraUUID = "f615bdc5-f42f-4729-9482-c53d6942973f";*/
/*const nickname = "DUMMY";*/

const cameraId = "Stream";
const cameraUUID = "Stream";
/* This is the callback from sse.js giving reselts*/
document.addEventListener('cameraStateUpdated', evt => {
    if (evt.detail) {
        updatePolledDetectionData(evt.detail);
    }
});

fetchAndUpdateMetricsForCamera(cameraId);


