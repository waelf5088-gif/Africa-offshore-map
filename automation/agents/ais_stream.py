#!/usr/bin/env python
"""Helper AIS-LIVE : collecte des positions AIS via AISStream.io (WebSocket) sur des
boites englobantes couvrant l'offshore Afrique de l'Ouest et de l'Est, pendant N secondes,
puis ecrit automation/data/ais.json. Appele par ais-live.ps1.

Necessite : AISSTREAM_API_KEY (env) et la lib 'websockets' (installee au besoin par l'agent).
"""
import asyncio
import json
import os
import sys
from datetime import datetime, timezone

# Navires prioritaires (IMO) — matching best-effort sur les ShipStaticData recues.
PRIORITY_IMOS = {
    9652143: "Leo", 9582764: "Lydia D", 9343948: "Santangelo", 9366316: "Nomasa",
    9654983: "Topaz Dignity", 9319193: "Red Fox", 9423877: "Monty J",
}

# Boites : [ [lat_min, lon_min], [lat_max, lon_max] ]  (Golfe de Guinee + Afrique australe/Est)
BBOXES = [[[-35.0, -20.0], [10.0, 15.0]], [[-30.0, 30.0], [2.0, 52.0]]]


async def collect(api_key: str, duration: int, out_path: str) -> int:
    import websockets  # importe ici pour permettre l'auto-install prealable

    positions, statics = {}, {}
    deadline = asyncio.get_event_loop().time() + duration
    try:
        async with websockets.connect("wss://stream.aisstream.io/v0/stream") as ws:
            await ws.send(json.dumps({
                "APIKey": api_key,
                "BoundingBoxes": BBOXES,
                "FilterMessageTypes": ["PositionReport", "ShipStaticData"],
            }))
            while asyncio.get_event_loop().time() < deadline:
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=max(1, deadline - asyncio.get_event_loop().time()))
                except asyncio.TimeoutError:
                    break
                msg = json.loads(raw)
                mtype = msg.get("MessageType")
                meta = msg.get("MetaData", {})
                mmsi = meta.get("MMSI")
                if mtype == "PositionReport":
                    pr = msg["Message"]["PositionReport"]
                    positions[mmsi] = {
                        "mmsi": mmsi, "name": (meta.get("ShipName") or "").strip(),
                        "lat": pr.get("Latitude"), "lon": pr.get("Longitude"),
                        "sog": pr.get("Sog"), "cog": pr.get("Cog"),
                        "ts": meta.get("time_utc"),
                    }
                elif mtype == "ShipStaticData":
                    imo = msg["Message"]["ShipStaticData"].get("ImoNumber")
                    if imo in PRIORITY_IMOS:
                        statics[mmsi] = {"imo": imo, "priority_name": PRIORITY_IMOS[imo]}
    except Exception as exc:  # noqa: BLE001
        sys.stderr.write(f"AIS erreur: {exc}\n")

    # Fusionne : marque les positions correspondant aux IMO prioritaires.
    for mmsi, st in statics.items():
        if mmsi in positions:
            positions[mmsi].update(priority=True, imo=st["imo"], priority_name=st["priority_name"])

    priority = [p for p in positions.values() if p.get("priority")]
    out = {
        "source": "AISStream.io",
        "fetched": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "vessels_seen": len(positions),
        "priority_count": len(priority),
        "priority": priority,
        "all": list(positions.values())[:500],
    }
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
    print(f"AIS: {len(positions)} navires vus, {len(priority)} prioritaires -> {out_path}")
    return 0


def main() -> int:
    api_key = os.environ.get("AISSTREAM_API_KEY")
    if not api_key:
        sys.stderr.write("AISSTREAM_API_KEY absente\n")
        return 2
    duration = int(sys.argv[1]) if len(sys.argv) > 1 else 35
    out_path = sys.argv[2] if len(sys.argv) > 2 else "ais.json"
    return asyncio.run(collect(api_key, duration, out_path))


if __name__ == "__main__":
    raise SystemExit(main())
