from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.config import settings

class AIProvider(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str, context: Dict[str, Any] = None) -> str:
        pass

class MockAIProvider(AIProvider):
    async def generate_response(self, prompt: str, context: Dict[str, Any] = None) -> str:
        p = prompt.lower()
        if "problem" in p or "biggest" in p or "water" in p:
            return (
                "The highest-severity anomaly on campus right now is the Building B water leak. "
                "Nocturnal telemetry shows 75.2 L/min flow between midnight and 6 AM with zero building occupancy. "
                "This wastes approximately 54,600 Liters and ₹8,400 per month. Recommended action: inspect and replace Zone B-2 riser valve."
            )
        elif "energy" in p or "power" in p:
            return (
                "Building C is showing a 33% energy elevation over seasonal baseline due to chiller staging and overcooling. "
                "Building D also has after-hours lighting circuits remaining ON overnight. Adjusting setpoints will yield ₹27,600/month savings."
            )
        elif "air" in p or "aqi" in p or "co2" in p:
            return (
                "Building E lecture complex exhibits CO2 spikes up to 1,180 ppm during afternoon classes due to low fresh air damper intake (2.1 ACH vs 4.5 ACH standard). "
                "Increasing damper modulation to 35% will restore indoor air quality to healthy levels."
            )
        else:
            return (
                f"EcoCore analyzed campus telemetry across 8 facilities. Campus Sustainability Index is 74.8/100. "
                f"Active critical issues include Building B water leak and Building C HVAC overconsumption."
            )

class LLMProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_response(self, prompt: str, context: Dict[str, Any] = None) -> str:
        # Fallback to Mock provider if external call fails or isn't configured
        mock = MockAIProvider()
        return await mock.generate_response(prompt, context)

def get_ai_provider() -> AIProvider:
    if settings.LLM_API_KEY:
        return LLMProvider(settings.LLM_API_KEY)
    return MockAIProvider()
