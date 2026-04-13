import time
from logger_module import logger

from fastapi import Form, Request, APIRouter
from fastapi.exceptions import HTTPException
from fastapi.responses import RedirectResponse

from utils.config import (STREAM_MAX_FPS,
                            STREAM_JPEG_QUALITY, STREAM_MAX_WIDTH,
                            DETECTION_INTERVAL_MS,
                            MIN_SSE_DISPATCH_DELAY_MS,COUNTDOWN_ACTION, COUNTDOWN_TIME, COUNTDOWN_CONTROL,
                            update_config, get_config)
from utils.camera_utils import update_camera_state
from utils.camera_state_manager import get_camera_state_manager
from utils.stream_utils import stream_optimizer
from models import FeedSettings, SavedConfig, CountdownSettings

router = APIRouter()

@router.post("/save-feed-settings", include_in_schema=False)
async def save_feed_settings(settings: FeedSettings):
    """Save camera feed and detection settings to configuration.

    Args:
        settings (FeedSettings): Feed configuration settings including FPS,
                                quality, detection intervals, and polling rates.

    Returns:
        dict: Success status and message indicating settings were saved.

    Raises:
        HTTPException: If saving fails due to validation or storage errors.
    """
    try:
        config_data = {
            SavedConfig.STREAM_MAX_FPS: settings.stream_max_fps,
            SavedConfig.STREAM_JPEG_QUALITY: settings.stream_jpeg_quality,
            SavedConfig.STREAM_MAX_WIDTH: settings.stream_max_width,
            SavedConfig.DETECTION_INTERVAL_MS: settings.detection_interval_ms,
            SavedConfig.MIN_SSE_DISPATCH_DELAY_MS: settings.min_sse_dispatch_delay_ms
        }
        update_config(config_data)
        stream_optimizer.invalidate_cache()
        logger.debug("Feed settings saved successfully.")
        return {"success": True, "message": "Feed settings saved successfully."}
    except Exception as e:
        logger.error("Error saving feed settings: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save feed settings: {str(e)}"
        )

@router.get("/get-feed-settings", include_in_schema=False)
async def get_feed_settings():
    """Retrieve current camera feed and detection settings.

    Returns:
        dict: Current feed settings including FPS, quality, detection intervals,
              polling rates, and calculated detections per second.

    Raises:
        HTTPException: If loading settings fails due to configuration errors.
    """
    try:
        config = get_config()
        # pylint:disable=import-outside-toplevel
        settings = {
            "stream_max_fps": config.get(SavedConfig.STREAM_MAX_FPS, STREAM_MAX_FPS),
            "stream_jpeg_quality": config.get(SavedConfig.STREAM_JPEG_QUALITY, STREAM_JPEG_QUALITY),
            "stream_max_width": config.get(SavedConfig.STREAM_MAX_WIDTH, STREAM_MAX_WIDTH),
            "detection_interval_ms": config.get(SavedConfig.DETECTION_INTERVAL_MS, DETECTION_INTERVAL_MS),
            "min_sse_dispatch_delay_ms": config.get(SavedConfig.MIN_SSE_DISPATCH_DELAY_MS, MIN_SSE_DISPATCH_DELAY_MS)
        }
        settings["detections_per_second"] = round(1000 / settings["detection_interval_ms"])
        return {"success": True, "settings": settings}
    except Exception as e:
        logger.error("Error loading feed settings: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load feed settings: {str(e)}"
        )
    
@router.get("/get-countdown-settings", include_in_schema=False)

async def get_countdown_settings():
    """Retrieve countdown settings.

    Returns:
        dict: Current countdown_action and countdown_time

    Raises:
        HTTPException: If loading settings fails due to configuration errors.
    """
    try:
        config = get_config()
        config = config.get(SavedConfig.COUNTDOWN, {})

        # pylint:disable=import-outside-toplevel

        
        countdown = {
            SavedConfig.COUNTDOWN_ACTION.value: config.get(SavedConfig.COUNTDOWN_ACTION, COUNTDOWN_ACTION),
            SavedConfig.COUNTDOWN_TIME.value: config.get(SavedConfig.COUNTDOWN_TIME, COUNTDOWN_TIME),
            SavedConfig.COUNTDOWN_CONTROL.value: config.get(SavedConfig.COUNTDOWN_CONTROL, COUNTDOWN_CONTROL)
        }
        print(countdown)
        return {"success": True, "countdown": countdown}
    except Exception as e:
        logger.error("Error loading countdown settings: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load countdown settings: {str(e)}"
        )
    
#SRS Unused for now - may want to add back in later if we want a non js way to update these settings    
@router.post("/save-countdown-settings ", include_in_schema=False)
async def save_countdown_settings(settings: CountdownSettings):
    """Save countdown settings to configuration.

    Args:
        settings (CountdownSettings): Countdown configuration settings including action, time, and condition.

    Returns:
        dict: Success status and message indicating settings were saved.

    Raises:
        HTTPException: If saving fails due to validation or storage errors.
    """
    try:
        config_data = {
            SavedConfig.COUNTDOWN: {
                SavedConfig.COUNTDOWN_ACTION: settings.countdown_action,
                SavedConfig.COUNTDOWN_TIME: settings.countdown_time,
                SavedConfig.COUNTDOWN_CONTROL: settings.countdown_control
            }
        }
        update_config(config_data)
        #ream_optimizer.invalidate_cache()
        logger.debug("Countdown settings saved successfully.")
        return {"success": True, "message": "Countdown settings saved successfully."}
    except Exception as e:
        logger.error("Error saving countdown settings: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save countdown settings: {str(e)}"
        )