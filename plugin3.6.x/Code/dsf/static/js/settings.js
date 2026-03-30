
const camVideoPreview = document.getElementById('videoPreview');
const loadingOverlay = document.getElementById('loadingOverlay');
const cameraItems = document.querySelectorAll('.camera-item');
const settingsCameraUUID = document.getElementById('camera_uuid');
const settingsSensitivity = document.getElementById('sensitivity');
const settingsSensitivityLabel = document.getElementById('sensitivity_val');
const settingsBrightness = document.getElementById('brightness');
const settingsBrightnessLabel = document.getElementById('brightness_val');
const settingsContrast = document.getElementById('contrast');
const settingsContrastLabel = document.getElementById('contrast_val');
const settingsFocus = document.getElementById('focus');
const settingsFocusLabel = document.getElementById('focus_val');
const settingsCountdownTime = document.getElementById('countdown_time');
const settingsCountdownTimeLabel = document.getElementById('countdown_time_val');
const settingsCountdownControl = document.getElementById('countdowncontrol');
const settingsCountdownControlLabel = document.getElementById('countdowncontrol_val');
const settingsMajorityVoteThreshold = document.getElementById('majority_vote_threshold');
const settingsMajorityVoteThresholdLabel = document.getElementById('majority_vote_threshold_val');
const settingsMajorityVoteWindow = document.getElementById('majority_vote_window');
const settingsMajorityVoteWindowLabel = document.getElementById('majority_vote_window_val');
const settingsCountdownAction = document.getElementById('countdown_action');

const addCameraModalOverlay = document.getElementById('addCameraModalOverlay');
const addCameraModalClose = document.getElementById('addCameraModalClose');
const addCameraBtn = document.getElementById('addCameraBtn');
const addFirstCameraBtn = document.getElementById('addFirstCameraBtn');

camVideoPreview.onload = () => {
    loadingOverlay.style.display = 'none';
};

camVideoPreview.onerror = () => {
    loadingOverlay.style.display = 'none';
    console.error("Failed to load camera feed.");
};

let cameraUUID = 0;

function changeLiveCameraFeed(cameraUUID) {
    loadingOverlay.style.display = 'flex';
    camVideoPreview.src = `/camera/feed/${cameraUUID}`;
}


function updateSelectedCameraSettings(d) {
    console.warn('updateSelectedCameraSettings: ==>', d.camera_uuid);
    // Camera settings
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
    settingsMajorityVoteThresholdLabel.textContent = d.majority_vote_threshold;
    settingsMajorityVoteThreshold.value = d.majority_vote_threshold;
    updateSliderFill(settingsMajorityVoteThreshold);
    settingsMajorityVoteWindowLabel.textContent = d.majority_vote_window;
    settingsMajorityVoteWindow.value = d.majority_vote_window;
    updateSliderFill(settingsMajorityVoteWindow);



}


function removeCamera(cameraUUID) {
    if (!cameraUUID) {
        console.warn('Cannot remove camera: invalid camera UUID provided.');
        return;
    }
    if (!confirm('Are you sure you want to remove this camera?')) {
        return;
    }
    fetch('/camera/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camera_uuid: cameraUUID })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(`Failed to remove camera ${cameraUUID}: ${errData.detail || response.statusText}`);
            });
        }
        return response.json();
    })
    .then(() => {
        const cameraItem = document.querySelector(`.camera-item[data-camera-id="${cameraUUID}"]`);
        if (cameraItem) {
            cameraItem.remove();
        }
        if (window.cameraUUID === cameraUUID) {
            const firstCamera = document.querySelector('.camera-item');
            if (firstCamera) {
                firstCamera.click();
            } else {
                window.location.reload();
            }
        }
        const remainingCameras = document.querySelectorAll('.camera-item');
        if (remainingCameras.length === 0) {
            if (addCameraModalOverlay) {
                addCameraModalOverlay.style.display = 'flex';
            }
        }
    })
    .catch(error => {
        console.error(`Error removing camera ${cameraUUID}:`, error.message);
        alert(`Failed to remove camera: ${error.message}`);
    });
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
        updateSelectedCameraSettings(metricsData);
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
            settingsCameraUUID.value = cameraId;
            fetchAndUpdateMetricsForCamera(cameraId);
        } else {
            console.warn('No camera ID found for selected item');
            cameraUUID = null;
            settingsCameraUUID.value = '';
        }
    });

    const removeButton = item.querySelector('.remove-camera-btn');
    removeButton.addEventListener('click', function(event) {
        event.stopPropagation();
        const cameraId = item.dataset.cameraId;
        removeCamera(cameraId);
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const firstCameraItem = cameraItems[0];
    if (firstCameraItem) {
        const cameraId = firstCameraItem.dataset.cameraId;
        if (cameraId) {
            firstCameraItem.click();
        } else {
            if (addCameraModalOverlay) {
                addCameraModalOverlay.style.display = 'flex';
            }
        }
    }
});

addCameraBtn?.addEventListener('click', function(e) {
    e.preventDefault();
    addCameraModalOverlay.style.display = 'flex';
});

addFirstCameraBtn?.addEventListener('click', function(e) {
    e.preventDefault();
    addCameraModalOverlay.style.display = 'flex';
});


function updateSliderFill(slider) {
    const min = slider.min || 0;
    const max = slider.max || 100;
    const value = slider.value;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--value', `${percentage}%`);
    const valueSpan = document.getElementById(`${slider.id}_val`);
    if (valueSpan) {
        valueSpan.textContent = value;
    }
}

function saveSetting(slider) {
    const settingsForm = slider.closest('form');
    if (!settingsForm) return;
    const formData = new FormData(settingsForm);
    const setting = slider.name;
    const value = slider.value;
    console.warn(`Saving setting ${setting} with value ${value}`);
    for (let [key, value] of formData.entries()) {
    console.log(key, value);
}

    fetch(settingsForm.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData)
    })
    .then(response => {
        if (response.ok) {
            const valueSpan = document.getElementById(`${slider.id}_val`);
            if (valueSpan) {
                valueSpan.textContent = value;
            }
        } else {
            console.error(`Failed to update setting ${setting}`);
        }
    })
    .catch(error => {
        console.error(`Error saving setting ${setting}:`, error);
    });
}

document.querySelectorAll('.settings-form input[type="range"]').forEach(slider => {
    updateSliderFill(slider);
    slider.addEventListener('input', () => {
        updateSliderFill(slider);
    });
    slider.addEventListener('change', (e) => {
        e.preventDefault();
        updateSliderFill(slider);
        saveSetting(slider);
    });
});

document.getElementById('countdown_action').addEventListener('change', (e) => {
    console.warn('Countdown Settings now ' + e.target.value)
    saveSetting(e.target);
});

document.querySelector('.settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
});

function updateFeedSliderFill(slider) {
    const min = slider.min || 0;
    const max = slider.max || 100;
    const value = slider.value;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--value', `${percentage}%`);
    const valueSpan = document.getElementById(`${slider.id}_val`);
    if (valueSpan) {
        valueSpan.textContent = value;
    }
}

/*SRS - Keep feed settings for now - not convinced of utility*/

function saveFeedSetting(slider) {
    const setting = slider.name;
    const value = parseInt(slider.value);
    const valueSpan = document.getElementById(`${slider.id}_val`);
    if (valueSpan) {
        valueSpan.textContent = value;
    }
    if (setting === 'detectionInterval') {
        const detectionsPerSecond = Math.round(1000 / value);
        const dpsSlider = document.getElementById('detectionsPerSecond');
        const dpsSpan = document.getElementById('detectionsPerSecond_val');
        if (dpsSlider && dpsSpan) {
            dpsSlider.value = detectionsPerSecond;
            dpsSpan.textContent = detectionsPerSecond;
            updateFeedSliderFill(dpsSlider);
        }
    } else if (setting === 'detectionsPerSecond') {
        const detectionInterval = Math.round(1000 / value);
        const diSlider = document.getElementById('detectionInterval');
        const diSpan = document.getElementById('detectionInterval_val');
        if (diSlider && diSpan) {
            diSlider.value = detectionInterval;
            diSpan.textContent = detectionInterval;
            updateFeedSliderFill(diSlider);
        }
    }
    saveFeedSettings();
}

function saveFeedSettings() {
    console.warn('Save Feed Settings');
    const settings = {
        stream_max_fps: parseInt(document.getElementById('streamMaxFps').value),
        stream_tunnel_fps: parseInt(document.getElementById('streamTunnelFps').value),
        stream_jpeg_quality: parseInt(document.getElementById('streamJpegQuality').value),
        stream_max_width: parseInt(document.getElementById('streamMaxWidth').value),
        detections_per_second: parseInt(document.getElementById('detectionsPerSecond').value),
        detection_interval_ms: parseInt(document.getElementById('detectionInterval').value),
        printer_stat_polling_rate_ms: parseInt(document.getElementById('printerStatPollingRate').value),
        min_sse_dispatch_delay_ms: parseInt(document.getElementById('minSseDispatchDelay').value)
    };
    fetch('/save-feed-settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(errData.detail || 'Failed to save feed settings');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Feed settings saved successfully:', data);
    })
    .catch(error => {
        console.error('Error saving feed settings:', error);
    });
}

function initializeFeedSettings() {
    loadFeedSettings().then(() => {
        document.querySelectorAll('.feed-setting-item input[type="range"]').forEach(slider => {
            updateFeedSliderFill(slider);
            slider.addEventListener('input', () => {
                updateFeedSliderFill(slider);
            });
            slider.addEventListener('change', (e) => {
                e.preventDefault();
                updateFeedSliderFill(slider);
                saveFeedSetting(slider);
            });
        });
    });
}

function loadFeedSettings() {
    return fetch('/get-feed-settings', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(errData.detail || 'Failed to load feed settings');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success && data.settings) {
            const settings = data.settings;
            updateSliderValue('streamMaxFps', settings.stream_max_fps);
            updateSliderValue('streamTunnelFps', settings.stream_tunnel_fps);
            updateSliderValue('streamJpegQuality', settings.stream_jpeg_quality);
            updateSliderValue('streamMaxWidth', settings.stream_max_width);
            updateSliderValue('detectionsPerSecond', settings.detections_per_second);
            updateSliderValue('detectionInterval', settings.detection_interval_ms);
            updateSliderValue('printerStatPollingRate', settings.printer_stat_polling_rate_ms);
            updateSliderValue('minSseDispatchDelay', settings.min_sse_dispatch_delay_ms);
        }
    })
    .catch(error => {
        console.error('Error loading feed settings:', error);
    });
}

function updateSliderValue(sliderId, value) {
    const slider = document.getElementById(sliderId);
    const valueSpan = document.getElementById(`${sliderId}_val`);
    if (slider && valueSpan) {
        slider.value = value;
        valueSpan.textContent = value;
        updateFeedSliderFill(slider);
    }
}


setupModalClose?.addEventListener('click', function() {
    setupModalOverlay.style.display = 'none';
    document.body.style.overflow = '';
});


addCameraModalClose?.addEventListener('click', function() {
    if (addCameraModalOverlay) {
        addCameraModalOverlay.style.display = 'none';
    }
});

addCameraModalOverlay?.addEventListener('click', function(e) {
    if (e.target === addCameraModalOverlay) {
        addCameraModalOverlay.style.display = 'none';
    }
});

const addSerialCameraButton = document.getElementById('addSerialCameraButton');
const addRtspCameraButton = document.getElementById('addRtspCameraButton');
const cameraTypeSelection = document.getElementById('cameraTypeSelection');
const addCameraForm = document.getElementById('addCameraForm');
const serialCameraSetup = document.getElementById('serialCameraSetup');
const rtspCameraSetup = document.getElementById('rtspCameraSetup');
const serialDeviceSelect = document.getElementById('serialDevice');
const rtspUrlInput = document.getElementById('rtspUrl');
const serialLoading = document.getElementById('serialLoading');
const noSerialDeviceMessage = document.getElementById('noSerialDeviceMessage');

const enablePreview = document.getElementById('enablePreview');
const cameraPreviewContainer = document.getElementById('cameraPreviewContainer');
const cameraPreviewImage = document.getElementById('cameraPreviewImage');
const cameraPreviewLoading = document.getElementById('cameraPreviewLoading');
const cameraPreviewError = document.getElementById('cameraPreviewError');

let previewUpdateTimeout;

function showPreviewLoading() {
    cameraPreviewImage.style.display = 'none';
    cameraPreviewError.style.display = 'none';
    cameraPreviewLoading.style.display = 'flex';
}

function showPreviewError() {
    cameraPreviewImage.style.display = 'none';
    cameraPreviewLoading.style.display = 'none';
    cameraPreviewError.style.display = 'flex';
}

function showPreviewImage(src) {
    cameraPreviewLoading.style.display = 'none';
    cameraPreviewError.style.display = 'none';
    cameraPreviewImage.src = src;
    cameraPreviewImage.style.display = 'block';
}

function hidePreview() {
    cameraPreviewContainer.style.display = 'none';
    cameraPreviewImage.style.display = 'none';
    cameraPreviewLoading.style.display = 'none';
    cameraPreviewError.style.display = 'none';
}

function updatePreview() {
    if (!enablePreview.checked) {
        hidePreview();
        return;
    }
    
    cameraPreviewContainer.style.display = 'block';
    let source = '';
    if (serialCameraSetup.style.display !== 'none' && serialDeviceSelect.value) {
        source = serialDeviceSelect.value;
    } else if (rtspCameraSetup.style.display !== 'none' && rtspUrlInput.value) {
        source = rtspUrlInput.value;
    }
    if (!source) {
        showPreviewError();
        return;
    }
    showPreviewLoading();
    const previewUrl = `/camera/preview?source=${encodeURIComponent(source)}`;
    const img = new Image();
    img.onload = function() {
        showPreviewImage(previewUrl);
    };
    img.onerror = function() {
        showPreviewError();
    };
    img.src = previewUrl;
}

function schedulePreviewUpdate() {
    if (previewUpdateTimeout) {
        clearTimeout(previewUpdateTimeout);
    }
    previewUpdateTimeout = setTimeout(updatePreview, 1000);
}

addSerialCameraButton?.addEventListener('click', async () => {
    cameraTypeSelection.style.display = 'none';
    addCameraForm.style.display = 'block';
    serialCameraSetup.style.display = 'block';
    rtspCameraSetup.style.display = 'none';
    rtspUrlInput.required = false;
    serialDeviceSelect.required = true;
    serialLoading.style.display = 'block';
    serialDeviceSelect.style.display = 'none';
    noSerialDeviceMessage.style.display = 'none';

    try {
        const response = await fetch('/camera/serial_devices');
        const devices = await response.json();
        serialDeviceSelect.innerHTML = '';
        if (devices.length > 0) {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a serial device';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            serialDeviceSelect.appendChild(defaultOption);
            
            devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device;
                option.textContent = device;
                serialDeviceSelect.appendChild(option);
            });
            serialDeviceSelect.style.display = 'block';
            serialDeviceSelect.selectedIndex = 0;
            const changeEvent = new Event('change', { bubbles: true });
            serialDeviceSelect.dispatchEvent(changeEvent);
        } else {
            noSerialDeviceMessage.style.display = 'block';
            serialDeviceSelect.required = false;
        }
    } catch (error) {
        console.error('Error fetching serial devices:', error);
        noSerialDeviceMessage.textContent = 'Error fetching devices.';
        noSerialDeviceMessage.style.display = 'block';
    } finally {
        serialLoading.style.display = 'none';
    }
});

addRtspCameraButton?.addEventListener('click', () => {
    cameraTypeSelection.style.display = 'none';
    addCameraForm.style.display = 'block';
    serialCameraSetup.style.display = 'none';
    rtspCameraSetup.style.display = 'block';
    serialDeviceSelect.required = false;
    rtspUrlInput.required = true;
});

enablePreview?.addEventListener('change', updatePreview);

serialDeviceSelect?.addEventListener('change', () => {
    if (enablePreview.checked) {
        updatePreview();
    }
});

rtspUrlInput?.addEventListener('input', () => {
    if (enablePreview.checked) {
        schedulePreviewUpdate();
    }
});

addCameraForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(addCameraForm);
    const data = {};
    formData.forEach((value, key) => {
        if (value) {
            data[key] = value;
        }
    });

    try {
        const response = await fetch('/camera/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            addCameraModalOverlay.style.display = 'none';
            addCameraForm.reset();
            addCameraForm.style.display = 'none';
            cameraTypeSelection.style.display = 'flex';
            location.reload();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.detail}`);
        }
    } catch (error) {
        console.error('Error adding camera:', error);
        alert('An error occurred while adding the camera.');
    }
});

addCameraModalClose?.addEventListener('click', function() {
    addCameraModalOverlay.style.display = 'none';
    addCameraForm.reset();
    addCameraForm.style.display = 'none';
    cameraTypeSelection.style.display = 'flex';
    serialCameraSetup.style.display = 'none';
    rtspCameraSetup.style.display = 'none';
    serialDeviceSelect.required = false;
    rtspUrlInput.required = false;
    serialDeviceSelect.innerHTML = '';
    serialDeviceSelect.style.display = 'none';
    noSerialDeviceMessage.style.display = 'none';
    serialLoading.style.display = 'none';
    enablePreview.checked = false;
    hidePreview();
    if (previewUpdateTimeout) {
        clearTimeout(previewUpdateTimeout);
    }
});
