from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

from app.services.receipt_vision import ReceiptAnalysisError, ReceiptAnalyzer
from app.services.simulator import SmsSimulator

simulator = SmsSimulator(interval_seconds=2.0)
receipt_analyzer = ReceiptAnalyzer()


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        yield
    finally:
        await simulator.stop()


app = FastAPI(
    title="Finance SMS Simulator Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationStatusResponse(BaseModel):
    running: bool
    interval_seconds: float


class SimulationControlRequest(BaseModel):
    state: Literal["start", "stop"] = Field(
        description="Start or stop simulated incoming SMS messages"
    )


class ReceiptFeatureStatusResponse(BaseModel):
    configured: bool
    model: str


class DemoScenario(BaseModel):
    id: str
    name: str
    description: str
    running: bool = False


class DemoScenarioListResponse(BaseModel):
    scenarios: list[DemoScenario]
    activeScenarioId: str


class ActivateScenarioRequest(BaseModel):
    scenarioId: str


DEMO_SCENARIOS: list[DemoScenario] = [
    DemoScenario(
        id="balanced",
        name="Balanced Household",
        description="General spending mix across groceries, utilities, and lifestyle.",
    ),
    DemoScenario(
        id="inflation",
        name="Inflation Pressure",
        description="Higher grocery and essentials movement to test anomaly and trend views.",
    ),
    DemoScenario(
        id="subscription-heavy",
        name="Subscription Heavy",
        description="Recurring digital services to stress recurring transaction analysis.",
    ),
]

active_demo_scenario_id = DEMO_SCENARIOS[0].id


CONTROL_UI = """
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SMS Simulator Control</title>
        <style>
            :root {
                font-family: Segoe UI, Arial, sans-serif;
                color-scheme: light;
            }
            body {
                margin: 0;
                background: linear-gradient(160deg, #f8fafc, #e2e8f0);
                min-height: 100vh;
                display: grid;
                place-items: center;
                color: #0f172a;
            }
            .panel {
                width: min(780px, 92vw);
                background: #ffffff;
                border: 1px solid #dbe2ea;
                border-radius: 14px;
                padding: 18px;
                box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
            }
            h1 {
                margin: 0 0 10px;
                font-size: 22px;
            }
            p {
                margin: 0;
                color: #475569;
            }
            .row {
                margin-top: 14px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                align-items: center;
            }
            button {
                border: 0;
                border-radius: 10px;
                padding: 9px 14px;
                font-weight: 600;
                cursor: pointer;
            }
            .start {
                background: #0ea5e9;
                color: white;
            }
            .stop {
                background: #ef4444;
                color: white;
            }
            .status {
                font-size: 13px;
                font-weight: 600;
                color: #1e293b;
            }
            ul {
                margin: 12px 0 0;
                padding: 0;
                list-style: none;
                max-height: 300px;
                overflow: auto;
                border-top: 1px solid #e2e8f0;
            }
            li {
                font-size: 12px;
                padding: 9px 0;
                border-bottom: 1px solid #eef2f7;
            }
            .bucket {
                display: inline-block;
                margin-left: 6px;
                padding: 1px 6px;
                border-radius: 999px;
                background: #e0f2fe;
                color: #0369a1;
                font-weight: 700;
            }
        </style>
    </head>
    <body>
        <section class="panel">
            <h1>SMS Simulator Control</h1>
            <p>Use these controls to start or stop simulated SMS events. Your Vue frontend will update in realtime via WebSocket.</p>
            <div class="row">
                <button class="start" id="startBtn">Start Simulation</button>
                <button class="stop" id="stopBtn">Stop Simulation</button>
                <span class="status" id="statusText">Checking status...</span>
            </div>
            <ul id="messages"></ul>
        </section>

        <script>
            const statusText = document.getElementById('statusText');
            const messages = document.getElementById('messages');

            async function setState(state) {
                await fetch('/simulation/control', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ state })
                });
                await refreshStatus();
            }

            async function refreshStatus() {
                const res = await fetch('/simulation/status');
                const data = await res.json();
                statusText.textContent = data.running
                    ? `Running (every ${data.interval_seconds}s)`
                    : 'Stopped';
            }

            function renderMessage(item) {
                const li = document.createElement('li');
                li.innerHTML = `${item.timestamp} | ${item.message} <span class="bucket">${item.bucket}</span>`;
                messages.prepend(li);
                while (messages.children.length > 30) {
                    messages.removeChild(messages.lastChild);
                }
            }

            document.getElementById('startBtn').addEventListener('click', () => setState('start'));
            document.getElementById('stopBtn').addEventListener('click', () => setState('stop'));

            const wsProtocol = location.protocol === 'https:' ? 'wss' : 'ws';
            const ws = new WebSocket(`${wsProtocol}://${location.host}/ws/messages`);
            ws.onmessage = (event) => {
                const packet = JSON.parse(event.data);
                if (packet.type === 'history') {
                    messages.innerHTML = '';
                    (packet.messages || []).slice().reverse().forEach(renderMessage);
                    return;
                }
                if (packet.type === 'message') {
                    renderMessage(packet.data);
                }
            };

            refreshStatus();
        </script>
    </body>
</html>
"""


@app.get("/", response_class=HTMLResponse)
async def control_ui() -> HTMLResponse:
        return HTMLResponse(CONTROL_UI)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/messages")
async def get_messages() -> list[dict]:
    return simulator.history()


@app.get("/receipts/status", response_model=ReceiptFeatureStatusResponse)
async def receipt_status() -> ReceiptFeatureStatusResponse:
    return ReceiptFeatureStatusResponse(
        configured=receipt_analyzer.configured,
        model=receipt_analyzer.model,
    )


@app.get("/simulation/scenarios", response_model=DemoScenarioListResponse)
async def simulation_scenarios() -> DemoScenarioListResponse:
    scenarios = [
        DemoScenario(
            id=item.id,
            name=item.name,
            description=item.description,
            running=item.id == active_demo_scenario_id,
        )
        for item in DEMO_SCENARIOS
    ]
    return DemoScenarioListResponse(
        scenarios=scenarios,
        activeScenarioId=active_demo_scenario_id,
    )


@app.post("/simulation/scenarios/activate", response_model=DemoScenarioListResponse)
async def activate_simulation_scenario(payload: ActivateScenarioRequest) -> DemoScenarioListResponse:
    global active_demo_scenario_id
    valid_scenario_ids = {item.id for item in DEMO_SCENARIOS}

    if payload.scenarioId not in valid_scenario_ids:
        raise HTTPException(status_code=404, detail="Scenario not found.")

    active_demo_scenario_id = payload.scenarioId
    return await simulation_scenarios()


@app.post("/receipts/analyze")
async def analyze_receipt(file: UploadFile = File(...)) -> dict:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    try:
        return await receipt_analyzer.analyze_receipt(image_bytes, file.content_type)
    except ReceiptAnalysisError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/simulation/status", response_model=SimulationStatusResponse)
async def simulation_status() -> SimulationStatusResponse:
    return SimulationStatusResponse(
        running=simulator.running,
        interval_seconds=simulator.interval_seconds,
    )


@app.post("/simulation/control", response_model=SimulationStatusResponse)
async def simulation_control(payload: SimulationControlRequest) -> SimulationStatusResponse:
    if payload.state == "start":
        await simulator.start()
    else:
        await simulator.stop()

    return SimulationStatusResponse(
        running=simulator.running,
        interval_seconds=simulator.interval_seconds,
    )


@app.websocket("/ws/messages")
async def websocket_messages(websocket: WebSocket) -> None:
    await websocket.accept()
    queue = await simulator.subscribe()
    try:
        # Send current history first so client can render immediately.
        await websocket.send_json({"type": "history", "messages": simulator.history()})

        while True:
            message = await queue.get()
            await websocket.send_json({"type": "message", "data": message})
    except WebSocketDisconnect:
        pass
    finally:
        simulator.unsubscribe(queue)
