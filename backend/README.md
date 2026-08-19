# Cold-chain Backend

This backend implements the first working version of the cold-chain platform described in the project plan:

- sensor ingestion stays separate from camera capture
- raw sensor readings are stored for later analytics recalculation
- camera devices can be registered independently of sensor devices
- captures are stored on disk and linked from the database
- a placeholder VVM classifier is included so the camera-to-result pipeline works end to end

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API starts at `http://127.0.0.1:8000` and serves capture files under `/storage`.

## Main routes

- `GET /health`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/locations`
- `GET /api/v1/devices`
- `GET /api/v1/devices/{device_id}/temperature`
- `POST /api/v1/sensor/readings`
- `GET /api/v1/batches`
- `GET /api/v1/batches/{batch_id}`
- `GET /api/v1/alerts`
- `GET /api/v1/cameras`
- `POST /api/v1/cameras`
- `POST /api/v1/cameras/{camera_id}/capture`
- `GET /api/v1/cameras/{camera_id}/latest-image`
