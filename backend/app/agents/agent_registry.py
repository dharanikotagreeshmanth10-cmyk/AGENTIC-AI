from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent

class AgentRegistry:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AgentRegistry, cls).__new__(cls)
            cls._instance.agents: Dict[str, BaseAgent] = {}
        return cls._instance

    def register_agent(self, agent: BaseAgent):
        self.agents[agent.agent_id] = agent

    def get_all_agents(self) -> List[BaseAgent]:
        return list(self.agents.values())

    def get_agent(self, agent_id: str) -> Optional[BaseAgent]:
        return self.agents.get(agent_id)

    def get_agent_health(self) -> List[Dict[str, Any]]:
        return [agent.health_check() for agent in self.agents.values()]

    def get_active_agents(self) -> List[BaseAgent]:
        return [a for a in self.agents.values() if a.status in ["ONLINE", "BUSY"]]

    def update_agent_status(self, agent_id: str, status: str):
        if agent_id in self.agents:
            self.agents[agent_id].status = status

    def assign_task(self, agent_id: str, task_id: str):
        if agent_id in self.agents:
            self.agents[agent_id].status = "BUSY"
            self.agents[agent_id].current_task = task_id

    def complete_task(self, agent_id: str):
        if agent_id in self.agents:
            self.agents[agent_id].status = "ONLINE"
            self.agents[agent_id].current_task = None

    def fail_task(self, agent_id: str):
        if agent_id in self.agents:
            self.agents[agent_id].status = "ERROR"

agent_registry = AgentRegistry()
            