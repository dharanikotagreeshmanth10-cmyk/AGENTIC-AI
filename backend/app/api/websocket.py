from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
from app.agents.event_bus import event_bus

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/agent-events")
async def websocket_agent_events(websocket: WebSocket):
    await websocket.accept()
    queue = asyncio.Queue()
    event_bus.subscribe(queue)
    
    # Send existing recent history
    for evt in event_bus.get_history(20):
        await websocket.send_text(json.dumps(evt))
        
    try:
        while True:
            # Deliver new events in real time
            event = await queue.get()
            await websocket.send_text(json.dumps(event))
    except WebSocketDisconnect:
        event_bus.unsubscribe(queue)
    except Exception:
        event_bus.unsubscribe(queue)
