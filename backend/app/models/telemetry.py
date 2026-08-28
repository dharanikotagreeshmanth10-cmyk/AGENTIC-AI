from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Index
from app.database.base import Base
import datetime

class EnergyReading(Base):
    __tablename__ = "energy_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    facility_id = Column(String(50), ForeignKey("facilities.id"), index=True)
    energy_kwh = Column(Float, nullable=False)
    hvac_load = Column(Float, default=0.0)
    lighting_load = Column(Float, default=0.0)
    equipment_load = Column(Float, default=0.0)
    peak_demand_kw = Column(Float, default=0.0)
    power_factor = Column(Float, default=0.95)

class WaterReading(Base):
    __tablename__ = "water_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    facility_id = Column(String(50), ForeignKey("facilities.id"), index=True)
    water_liters = Column(Float, nullable=False)
    flow_rate_lpm = Column(Float, default=0.0)
    pressure_psi = Column(Float, default=45.0)
    leak_probability = Column(Float, default=0.0)

class WasteReading(Base):
    __tablename__ = "waste_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    facility_id = Column(String(50), ForeignKey("facilities.id"), index=True)
    waste_kg = Column(Float, nullable=False)
    recycling_kg = Column(Float, default=0.0)
    compost_kg = Column(Float, default=0.0)
    landfill_kg = Column(Float, default=0.0)
    contamination_rate = Column(Float, default=0.05)

class AirQualityReading(Base):
    __tablename__ = "air_quality_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    facility_id = Column(String(50), ForeignKey("facilities.id"), index=True)
    aqi = Column(Float, nullable=False)
    pm25 = Column(Float, default=15.0)
    pm10 = Column(Float, default=25.0)
    co2 = Column(Float, default=420.0)
    temperature = Column(Float, default=23.0)
    humidity = Column(Float, default=50.0)
    ventilation_rate_ach = Column(Float, default=4.0)

class OccupancyReading(Base):
    __tablename__ = "occupancy_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    facility_id = Column(String(50), ForeignKey("facilities.id"), index=True)
    headcount = Column(Integer, nullable=False)
    utilization_pct = Column(Float, default=0.0)

class WeatherReading(Base):
    __tablename__ = "weather_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    temperature_c = Column(Float, default=24.0)
    humidity_pct = Column(Float, default=55.0)
    solar_irradiance = Column(Float, default=500.0)
    precipitation_mm = Column(Float, default=0.0)
