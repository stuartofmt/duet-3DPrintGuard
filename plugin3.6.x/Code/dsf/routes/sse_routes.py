from fastapi import APIRouter, Request, Body
from sse_starlette.sse import EventSourceResponse
from utils.sse_utils import outbound_packet_fetch, stop_and_remove_polling_task
from logger_module import logger
import asyncio

router = APIRouter()

# ✅ NEW: connection manager
class SSEManager:
    def __init__(self):
        self.clients = []
        self.lock = asyncio.Lock()

    async def connect(self):
        queue = asyncio.Queue()
        async with self.lock:
            self.clients.append(queue)
        return queue

    async def disconnect(self, queue):
        async with self.lock:
            if queue in self.clients:
                self.clients.remove(queue)

    async def broadcast(self, message):
        async with self.lock:
            for client in self.clients:
                await client.put(message)


manager = SSEManager()

# ✅ NEW: single shared background task
broadcast_task = None

async def start_broadcast_loop():
    global broadcast_task
    if broadcast_task is not None:
        return  # already running

    async def loop():
        async for packet in outbound_packet_fetch():
            await manager.broadcast(packet)

    broadcast_task = asyncio.create_task(loop())


@router.get("/sse")
async def sse_connect(request: Request):
    """Establish Server-Sent Events connection for real-time updates."""
    
    # ✅ ensure broadcaster is running
    await start_broadcast_loop()

    queue = await manager.connect()

    async def send_packet():
        try:
            while True:
                if await request.is_disconnected():
                    logger.warning('sse request disconnected')
                    logger.warning(f'{request}')
                    break

                packet = await queue.get()
                yield packet
        finally:
            await manager.disconnect(queue)

    return EventSourceResponse(send_packet())


@router.post("/sse/stop-polling")
async def stop_polling(request: Request, camera_uuid: str = Body(..., embed=True)):
    stop_and_remove_polling_task(camera_uuid)
    return {"message": "Polling stopped for camera UUID {}".format(camera_uuid)}