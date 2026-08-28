import asyncio
from typing import Dict, Any, List
import datetime

class EventBus:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EventBus, cls).__new__(cls)
            cls._instance.subscribers = []
            cls._instance.history = []
        return cls._instance

    def subscribe(self, queue: asyncio.Queue):
        if queue not in self.subscribers:
            self.subscribers.append(queue)

    def unsubscribe(self, queue: asyncio.Queue):
        if queue in self.subscribers:
            self.subscribers.remove(queue)

    async def emit(self, event_type: str, agent_id: str, task_id: str, message: str, payload: Dict[str, Any] = None):
        event = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "event_type": event_type,
            "agent_id": agent_id,
            "task_id": task_id,
            "message": message,
            "payload": payload or {}
        }
        self.history.append(event)
        if len(self.history) > 500:
            self.history.pop(0)

        # Broadcast to all live WebSockets
        for sub in list(self.subscribers):
            try:
                await sub.put(event)
            except Exception:
                pass
        return event

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.history[-limit:]

event_bus = EventBus()
