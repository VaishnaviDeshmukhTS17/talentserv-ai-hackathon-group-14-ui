from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "propintel"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def openai_configured(self) -> bool:
        key = self.openai_api_key.strip()
        return bool(key and key != "sk-your-openai-key-here")


settings = Settings()
