from pathlib import Path
import requests
import json


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

OUTPUT_DIR = BASE_DIR / "plots" / "route"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "hazaribagh_ranchi_tracking.html"


# ============================================================
# ROUTE
# ============================================================

STOPS = [
    {
        "name": "Hazaribagh",
        "lat": 23.99385,
        "lon": 85.39270,
        "type": "start"
    },
    {
        "name": "Ramgarh",
        "lat": 23.63224,
        "lon": 85.51257,
        "type": "delivery"
    },
    {
        "name": "Ormanjhi",
        "lat": 23.48345,
        "lon": 85.47606,
        "type": "delivery"
    },
    {
        "name": "Ranchi",
        "lat": 23.34316,
        "lon": 85.30940,
        "type": "destination"
    }
]


# ============================================================
# OSRM ROAD ROUTE
# ============================================================

def get_road_route():

    coordinates = ";".join(
        f"{stop['lon']},{stop['lat']}"
        for stop in STOPS
    )

    url = (
        f"https://router.project-osrm.org/route/v1/driving/"
        f"{coordinates}"
        f"?overview=full&geometries=geojson&steps=false"
    )

    print("Getting road route from OSRM...")

    response = requests.get(
        url,
        timeout=30
    )

    response.raise_for_status()

    data = response.json()

    if data["code"] != "Ok":
        raise RuntimeError("OSRM route could not be created.")

    route = data["routes"][0]

    geometry = route["geometry"]["coordinates"]

    distance_km = route["distance"] / 1000
    duration_min = route["duration"] / 60

    points = [
        [lat, lon]
        for lon, lat in geometry
    ]

    return points, distance_km, duration_min


# ============================================================
# CREATE HTML
# ============================================================

def create_html(points, distance_km, duration_min):

    route_points_json = json.dumps(points)
    stops_json = json.dumps(STOPS)

    html = f"""
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>AgroMarket Delivery Tracking</title>

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
/>


<!-- LEAFLET -->

<link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
</script>


<style>

* {{
    box-sizing: border-box;
}}

body {{
    margin: 0;
    font-family: Arial, sans-serif;
    background: #eef2f5;
}}

#map {{
    width: 100vw;
    height: 100vh;
}}


/* =====================================================
   CONTROL PANEL
   ===================================================== */

.panel {{

    position: absolute;

    top: 20px;
    left: 20px;

    width: 330px;

    background: rgba(255,255,255,0.97);

    padding: 22px;

    border-radius: 18px;

    box-shadow:
        0 8px 30px rgba(0,0,0,0.20);

    z-index: 1000;
}}


.title {{

    font-size: 24px;

    font-weight: bold;

    margin-bottom: 6px;

    color: #1f2937;
}}


.route-title {{

    font-size: 14px;

    color: #6b7280;

    margin-bottom: 18px;
}}


.info-box {{

    background: #f5f7fa;

    padding: 14px;

    border-radius: 12px;

    margin-bottom: 15px;
}}


.row {{

    display: flex;

    justify-content: space-between;

    margin: 9px 0;

    font-size: 15px;
}}


.label {{

    color: #6b7280;
}}


.value {{

    font-weight: bold;

    color: #1f2937;
}}


.status {{

    color: #1976d2;

}}


/* =====================================================
   PROGRESS
   ===================================================== */

.progress-label {{

    display: flex;

    justify-content: space-between;

    margin-bottom: 7px;

    font-size: 14px;
}}


.progress-container {{

    width: 100%;

    height: 10px;

    background: #dfe5eb;

    border-radius: 10px;

    overflow: hidden;
}}


#progressBar {{

    height: 100%;

    width: 0%;

    background: #1976d2;

    border-radius: 10px;

    transition: width 0.15s linear;
}}


/* =====================================================
   BUTTONS
   ===================================================== */

.buttons {{

    display: flex;

    gap: 8px;

    margin-top: 18px;
}}


button {{

    flex: 1;

    border: none;

    padding: 12px 8px;

    border-radius: 10px;

    color: white;

    background: #1976d2;

    font-size: 14px;

    font-weight: bold;

    cursor: pointer;
}}


button:hover {{

    opacity: 0.88;
}}


/* =====================================================
   LEGEND
   ===================================================== */

.legend {{

    display: flex;

    justify-content: space-between;

    margin-top: 18px;

    font-size: 13px;

    color: #555;
}}


.legend-item {{

    display: flex;

    align-items: center;

    gap: 5px;
}}


.legend-circle {{

    width: 13px;

    height: 13px;

    border-radius: 50%;
}}


.start-circle {{

    background: #16a34a;
}}


.delivery-circle {{

    background: #ef4444;
}}


.destination-circle {{

    background: #dc2626;
}}


/* =====================================================
   TRUCK / MOVING VEHICLE
   ONLY SMALL BLUE CIRCLE
   ===================================================== */

.vehicle-marker {{

    width: 22px;

    height: 22px;

    border-radius: 50%;

    background: #1976d2;

    border: 3px solid white;

    box-shadow:
        0 2px 8px rgba(0,0,0,0.35);

}}


/* =====================================================
   MOBILE
   ===================================================== */

@media(max-width:600px) {{

    .panel {{

        width: calc(100% - 30px);

        left: 15px;

        top: 15px;

        padding: 16px;
    }}

    .title {{

        font-size: 20px;
    }}

}}

</style>

</head>


<body>


<div id="map"></div>


<!-- =====================================================
     PANEL
     ===================================================== -->

<div class="panel">

    <div class="title">
        🌱 AgroMarket Delivery
    </div>

    <div class="route-title">
        Hazaribagh → Ramgarh → Ormanjhi → Ranchi
    </div>


    <div class="info-box">

        <div class="row">

            <span class="label">
                Status
            </span>

            <span
                class="value status"
                id="status">
                Ready
            </span>

        </div>


        <div class="row">

            <span class="label">
                Current
            </span>

            <span
                class="value"
                id="current">
                Hazaribagh
            </span>

        </div>


        <div class="row">

            <span class="label">
                Next Stop
            </span>

            <span
                class="value"
                id="nextStop">
                Ramgarh
            </span>

        </div>


        <div class="row">

            <span class="label">
                Distance
            </span>

            <span
                class="value"
                id="distance">
                {distance_km:.2f} km
            </span>

        </div>


        <div class="row">

            <span class="label">
                ETA
            </span>

            <span
                class="value"
                id="eta">
                {duration_min:.0f} min
            </span>

        </div>

    </div>


    <!-- PROGRESS -->

    <div class="progress-label">

        <span>
            Progress
        </span>

        <span id="progressText">
            0%
        </span>

    </div>


    <div class="progress-container">

        <div id="progressBar"></div>

    </div>


    <!-- BUTTONS -->

    <div class="buttons">

        <button onclick="startAnimation()">
            ▶ Start
        </button>

        <button onclick="pauseAnimation()">
            ⏸ Pause
        </button>

        <button onclick="resetAnimation()">
            ↻ Reset
        </button>

    </div>


    <!-- LEGEND -->

    <div class="legend">

        <div class="legend-item">

            <div
                class="legend-circle start-circle">
            </div>

            Start

        </div>


        <div class="legend-item">

            <div
                class="legend-circle delivery-circle">
            </div>

            Delivery

        </div>


        <div class="legend-item">

            <div
                class="legend-circle destination-circle">
            </div>

            Destination

        </div>

    </div>

</div>


<script>


// ========================================================
// DATA
// ========================================================

const routePoints =
    {route_points_json};


const stops =
    {stops_json};


// ========================================================
// MAP
// ========================================================

const map = L.map("map");


L.tileLayer(
    "https://tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png",
    {{

        maxZoom: 19,

        attribution:
            '&copy; OpenStreetMap contributors'

    }}
).addTo(map);


// ========================================================
// ROUTE LINE
// ========================================================

const routeLine = L.polyline(

    routePoints,

    {{

        color: "#1976d2",

        weight: 6,

        opacity: 0.9

    }}

).addTo(map);


// Fit route

map.fitBounds(
    routeLine.getBounds(),
    {{
        padding: [50, 50]
    }}
);


// ========================================================
// STOP ICONS
// ========================================================

function createStopIcon(type) {{

    let color = "#16a34a";
    let symbol = "●";

    if (type === "delivery") {{

        color = "#ef4444";

        symbol = "📍";

    }}

    if (type === "destination") {{

        color = "#dc2626";

        symbol = "●";

    }}

    return L.divIcon({{

        className: "",

        html: `
            <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: white;
                border: 2px solid ${{color}};
                display:flex;
                align-items:center;
                justify-content:center;
                box-shadow:0 2px 8px rgba(0,0,0,0.3);
                font-size:15px;
            ">
                <span style="color:${{color}}">
                    ${{symbol}}
                </span>
            </div>
        `,

        iconSize: [32,32],

        iconAnchor: [16,16]

    }});

}}


// ========================================================
// ADD STOP MARKERS
// ========================================================

stops.forEach(stop => {{

    const marker = L.marker(

        [stop.lat, stop.lon],

        {{
            icon: createStopIcon(stop.type)
        }}

    ).addTo(map);


    marker.bindTooltip(

        stop.name,

        {{
            permanent: true,

            direction: "right",

            offset: [12, 0]
        }}

    );

}});


// ========================================================
// SMALL BLUE CIRCLE VEHICLE
// ========================================================

const vehicleIcon = L.divIcon({{

    className: "",

    html: `
        <div class="vehicle-marker"></div>
    `,

    iconSize: [22,22],

    iconAnchor: [11,11]

}});


const vehicleMarker = L.marker(

    routePoints[0],

    {{
        icon: vehicleIcon,

        zIndexOffset: 1000
    }}

).addTo(map);


// ========================================================
// ANIMATION VARIABLES
// ========================================================

let currentIndex = 0;

let animationRunning = false;

let animationId = null;


// ========================================================
// ANIMATION SPEED
// ========================================================

// Smaller = slower
// Bigger = faster

const SPEED = 0.8;


// ========================================================
// START
// ========================================================

function startAnimation() {{

    if (animationRunning) {{
        return;
    }}

    animationRunning = true;

    document.getElementById("status")
        .innerText = "Moving";

    animate();

}}


// ========================================================
// PAUSE
// ========================================================

function pauseAnimation() {{

    animationRunning = false;

    document.getElementById("status")
        .innerText = "Paused";

    if (animationId) {{

        cancelAnimationFrame(animationId);

        animationId = null;

    }}

}}


// ========================================================
// RESET
// ========================================================

function resetAnimation() {{

    animationRunning = false;

    if (animationId) {{

        cancelAnimationFrame(animationId);

        animationId = null;

    }}

    currentIndex = 0;

    vehicleMarker.setLatLng(
        routePoints[0]
    );

    updateInformation();

    document.getElementById("status")
        .innerText = "Ready";

}}


// ========================================================
// ANIMATION
// ========================================================

function animate() {{

    if (!animationRunning) {{
        return;
    }}


    currentIndex += SPEED;


    if (currentIndex >= routePoints.length - 1) {{

        currentIndex =
            routePoints.length - 1;

        vehicleMarker.setLatLng(
            routePoints[currentIndex]
        );

        animationRunning = false;

        document.getElementById("status")
            .innerText = "Delivered";

        updateInformation();

        return;
    }}


    const index =
        Math.floor(currentIndex);


    const nextIndex =
        Math.min(
            index + 1,
            routePoints.length - 1
        );


    const point1 =
        routePoints[index];


    const point2 =
        routePoints[nextIndex];


    const fraction =
        currentIndex - index;


    const lat =
        point1[0] +
        (point2[0] - point1[0]) *
        fraction;


    const lon =
        point1[1] +
        (point2[1] - point1[1]) *
        fraction;


    vehicleMarker.setLatLng([
        lat,
        lon
    ]);


    // Follow vehicle

    map.panTo(
        [lat, lon],
        {{
            animate: true,

            duration: 0.1
        }}
    );


    updateInformation();


    animationId =
        requestAnimationFrame(
            animate
        );

}}


// ========================================================
// INFORMATION UPDATE
// ========================================================

function updateInformation() {{

    const progress =
        currentIndex /
        (routePoints.length - 1);


    const percentage =
        Math.min(
            100,
            Math.round(progress * 100)
        );


    document.getElementById(
        "progressBar"
    ).style.width =
        percentage + "%";


    document.getElementById(
        "progressText"
    ).innerText =
        percentage + "%";


    // Determine current stop

    let currentStop =
        stops[0];

    let nextStop =
        stops[1];


    if (percentage < 35) {{

        currentStop = stops[0];

        nextStop = stops[1];

    }}

    else if (percentage < 65) {{

        currentStop = stops[1];

        nextStop = stops[2];

    }}

    else if (percentage < 85) {{

        currentStop = stops[2];

        nextStop = stops[3];

    }}

    else {{

        currentStop = stops[3];

        nextStop = null;

    }}


    document.getElementById(
        "current"
    ).innerText =
        currentStop.name;


    document.getElementById(
        "nextStop"
    ).innerText =
        nextStop
            ? nextStop.name
            : "Delivered";


    const remaining =
        (1 - progress) *
        {distance_km};


    document.getElementById(
        "distance"
    ).innerText =
        Math.max(
            0,
            remaining
        ).toFixed(2) + " km";


    const remainingMinutes =
        (1 - progress) *
        {duration_min};


    document.getElementById(
        "eta"
    ).innerText =
        Math.max(
            0,
            remainingMinutes
        ).toFixed(0) + " min";

}}


// Initial information

updateInformation();

</script>


</body>

</html>
"""

    OUTPUT_FILE.write_text(
        html,
        encoding="utf-8"
    )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("AGROMARKET HAZARIBAGH → RANCHI TRACKING")
    print("=" * 60)

    try:

        points, distance_km, duration_min = get_road_route()

        print()
        print(f"Route distance : {distance_km:.2f} km")
        print(f"Route duration : {duration_min:.0f} minutes")
        print(f"Road points    : {len(points):,}")

        create_html(
            points,
            distance_km,
            duration_min
        )

        print()
        print("=" * 60)
        print("TRACKING MAP CREATED")
        print("=" * 60)

        print()
        print(f"File:")
        print(OUTPUT_FILE)

        print()
        print("Open with:")

        print(
            f"start .\\plots\\route\\{OUTPUT_FILE.name}"
        )

    except Exception as e:

        print()
        print("ERROR:")
        print(e)