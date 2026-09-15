## AgroMarket ML Service

This folder contains the merged attached AgroMarket source, datasets and trained models. Virtual environments and `.env` files are intentionally excluded.

### Run

```bash
cd ai-service/agromarket-ml
python -m pip install -r requirements.txt
python -m uvicorn api.main:app --host 0.0.0.0 --port 8002
```

Health: `GET /health`

The API exposes price, arrival, demand, supply, matching, route and chatbot routes. The chatbot accepts both `message` and Agrolink-compatible `question` payloads.

### Validation

```bash
python -m compileall -q .
python -c "from api.main import app; print(app.title)"
```
