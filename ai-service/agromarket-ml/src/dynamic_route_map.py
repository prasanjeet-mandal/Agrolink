import pandas as pd
import folium

from pathlib import Path
from folium.plugins import AntPath
import json


BASE_DIR = Path(__file__).resolve().parents[1]

COORD_FILE = (
    BASE_DIR.parent
    / "datasets"
    / "locations"
    / "city_coordinates.csv"
)

OUTPUT_DIR = BASE_DIR / "plots" / "route"

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


def create_route_map(
    route_result,
    filename="dynamic_route_map.html"
):

    # =========================================================
    # LOAD COORDINATES
    # =========================================================

    coords = pd.read_csv(COORD_FILE)

    coord_dict = {}

    for _, row in coords.iterrows():

        city = str(row["city"]).strip()

        coord_dict[city] = [
            float(row["latitude"]),
            float(row["longitude"])
        ]


    # =========================================================
    # DEPOT
    # =========================================================

    depot = str(route_result["depot"]).strip()

    if depot not in coord_dict:

        raise ValueError(
            f"Coordinates not found for depot: {depot}"
        )

    depot_lat, depot_lon = coord_dict[depot]


    # =========================================================
    # CREATE MAP
    # =========================================================

    route_map = folium.Map(

        location=[
            depot_lat,
            depot_lon
        ],

        zoom_start=5,

        control_scale=True,

        tiles="CartoDB positron"
    )


    # =========================================================
    # TITLE
    # =========================================================

    title_html = f"""

    <div style="
        position: fixed;
        top: 15px;
        left: 50px;
        z-index: 9999;

        background: white;
        padding: 14px 20px;

        border-radius: 12px;

        box-shadow:
        0 2px 10px rgba(0,0,0,0.20);

        font-family: Arial;
    ">

        <div style="
            font-size: 21px;
            font-weight: bold;
        ">

            🚚 AgroMarket

        </div>

        <div style="
            font-size: 13px;
            color: #666;
            margin-top: 4px;
        ">

            Live Delivery Tracking

        </div>

    </div>

    """

    route_map.get_root().html.add_child(
        folium.Element(title_html)
    )


    # =========================================================
    # LIVE STATUS PANEL
    # =========================================================

    status_html = """

    <div id="tracking-panel"

        style="
            position: fixed;
            top: 90px;
            right: 20px;

            z-index: 9999;

            background: white;

            width: 260px;

            padding: 16px;

            border-radius: 12px;

            box-shadow:
            0 2px 12px rgba(0,0,0,0.25);

            font-family: Arial;
        ">

        <div style="
            font-size: 17px;
            font-weight: bold;
            margin-bottom: 10px;
        ">

            🚚 Live Tracking

        </div>

        <div>

            Vehicle:
            <b id="vehicle-name">-</b>

        </div>

        <div style="margin-top:6px;">

            Status:
            <b id="vehicle-status">
                Starting
            </b>

        </div>

        <div style="margin-top:6px;">

            Current Location:
            <b id="vehicle-location">
                Depot
            </b>

        </div>

        <div style="margin-top:6px;">

            Next Stop:
            <b id="vehicle-next">
                -
            </b>

        </div>

    </div>

    """

    route_map.get_root().html.add_child(
        folium.Element(status_html)
    )


    # =========================================================
    # DEPOT
    # =========================================================

    folium.Marker(

        [
            depot_lat,
            depot_lon
        ],

        popup=f"""
        <b>🏠 Depot</b><br>
        {depot}
        """,

        tooltip=f"🏠 Depot: {depot}",

        icon=folium.Icon(
            color="black",
            icon="home",
            prefix="glyphicon"
        )

    ).add_to(route_map)


    # =========================================================
    # STORE VEHICLE TRACKING DATA
    # =========================================================

    tracking_data = []


    # =========================================================
    # VEHICLE ROUTES
    # =========================================================

    for vehicle_data in route_result["vehicles"]:

        vehicle_id = vehicle_data["vehicle"]

        route = vehicle_data["route"]

        load_kg = vehicle_data["load_kg"]

        capacity_kg = vehicle_data["capacity_kg"]

        utilization = vehicle_data[
            "utilization_percent"
        ]

        distance_km = vehicle_data[
            "distance_km"
        ]


        if not route:
            continue


        # -----------------------------------------------------
        # VALID ROUTE
        # -----------------------------------------------------

        valid_route = []

        route_coordinates = []


        for city in route:

            city = str(city).strip()

            if city not in coord_dict:

                print(
                    f"WARNING: Coordinates not found: {city}"
                )

                continue


            valid_route.append(city)

            route_coordinates.append(
                coord_dict[city]
            )


        if len(route_coordinates) < 2:
            continue


        # =====================================================
        # DRAW ROUTE
        # =====================================================

        folium.PolyLine(

            route_coordinates,

            color="blue",

            weight=5,

            opacity=0.35

        ).add_to(route_map)


        # Animated route line

        AntPath(

            route_coordinates,

            color="blue",

            weight=4,

            opacity=0.8,

            delay=800,

            dash_array=[10, 20]

        ).add_to(route_map)


        # =====================================================
        # DELIVERY STOP MARKERS
        # =====================================================

        for index, city in enumerate(valid_route):

            if city == depot:
                continue


            lat, lon = coord_dict[city]


            folium.Marker(

                [
                    lat,
                    lon
                ],

                tooltip=(
                    f"Stop {index}: {city}"
                ),

                popup=f"""
                <b>📍 Delivery Stop</b><br><br>

                Vehicle: {vehicle_id}<br>

                Stop: {index}<br>

                City: {city}<br>

                Status: Pending

                """,

                icon=folium.Icon(

                    color="gray",

                    icon="map-marker",

                    prefix="glyphicon"

                )

            ).add_to(route_map)


        # =====================================================
        # VEHICLE DATA FOR JAVASCRIPT
        # =====================================================

        tracking_data.append({

            "vehicle": vehicle_id,

            "route": [

                {
                    "city": city,

                    "lat": coord_dict[city][0],

                    "lon": coord_dict[city][1]

                }

                for city in valid_route
            ],

            "load": load_kg,

            "capacity": capacity_kg,

            "utilization": utilization,

            "distance": distance_km

        })


    # =========================================================
    # JAVASCRIPT LIVE SIMULATION
    # =========================================================

    tracking_json = json.dumps(
        tracking_data
    )


    map_name = route_map.get_name()


    javascript = f"""

    <script>

    // =====================================================
    // AGROMARKET LIVE DELIVERY SIMULATION
    // =====================================================

    var vehicles = {tracking_json};

    var map = {map_name};

    var vehicleMarkers = [];

    var vehicleIndex = 0;

    var segmentIndex = 0;

    var progress = 0;

    var animationSpeed = 0.002;


    // =====================================================
    // CREATE VEHICLE MARKER
    // =====================================================

    function createVehicleMarker(vehicle)
    {{

        var firstPoint =
            vehicle.route[0];


        var truckIcon =
            L.divIcon({{

                className:
                    "agromarket-truck",

                html:
                    '<div style="' +

                    'font-size:30px;' +

                    'background:white;' +

                    'border-radius:50%;' +

                    'width:46px;' +

                    'height:46px;' +

                    'text-align:center;' +

                    'line-height:46px;' +

                    'box-shadow:0 3px 10px rgba(0,0,0,0.35);' +

                    'border:2px solid #222;' +

                    '">' +

                    '🚚' +

                    '</div>',

                iconSize:
                    [46,46],

                iconAnchor:
                    [23,23]

            }});


        var marker =
            L.marker(

                [
                    firstPoint.lat,
                    firstPoint.lon
                ],

                {{
                    icon:
                        truckIcon,

                    zIndexOffset:
                        1000

                }}

            ).addTo(map);


        marker.bindPopup(

            "<b>🚚 Vehicle " +
            vehicle.vehicle +
            "</b><br><br>" +

            "Load: " +
            vehicle.load +
            " kg<br>" +

            "Capacity: " +
            vehicle.capacity +
            " kg<br>" +

            "Utilization: " +
            vehicle.utilization +
            "%<br>" +

            "Route Distance: " +
            vehicle.distance +
            " km"

        );


        return marker;

    }}


    // =====================================================
    // CREATE ALL VEHICLES
    // =====================================================

    for(
        var i = 0;
        i < vehicles.length;
        i++
    )
    {{

        vehicleMarkers.push(

            createVehicleMarker(
                vehicles[i]
            )

        );

    }}


    // =====================================================
    // DISTANCE BETWEEN TWO POINTS
    // =====================================================

    function distance(
        lat1,
        lon1,
        lat2,
        lon2
    )
    {{

        var dLat =
            lat2 - lat1;

        var dLon =
            lon2 - lon1;

        return Math.sqrt(
            dLat*dLat +
            dLon*dLon
        );

    }}


    // =====================================================
    // MOVE VEHICLE
    // =====================================================

    function moveVehicles()
    {{

        if(
            vehicles.length === 0
        )
        {{
            return;
        }}


        for(
            var v = 0;
            v < vehicles.length;
            v++
        )
        {{

            var vehicle =
                vehicles[v];


            var marker =
                vehicleMarkers[v];


            var route =
                vehicle.route;


            if(
                route.length < 2
            )
            {{
                continue;
            }}


            var currentSegment =
                segmentIndex %
                (route.length - 1);


            var start =
                route[currentSegment];


            var end =
                route[currentSegment + 1];


            // ---------------------------------------------
            // INTERPOLATION
            // ---------------------------------------------

            var lat =
                start.lat +
                (
                    end.lat -
                    start.lat
                ) *
                progress;


            var lon =
                start.lon +
                (
                    end.lon -
                    start.lon
                ) *
                progress;


            marker.setLatLng(
                [lat, lon]
            );


            // ---------------------------------------------
            // UPDATE PANEL
            // ---------------------------------------------

            if(v === 0)
            {{

                document.getElementById(
                    "vehicle-name"
                ).innerHTML =
                    "Vehicle " +
                    vehicle.vehicle;


                document.getElementById(
                    "vehicle-location"
                ).innerHTML =
                    start.city;


                document.getElementById(
                    "vehicle-next"
                ).innerHTML =
                    end.city;


                document.getElementById(
                    "vehicle-status"
                ).innerHTML =
                    "🚚 En Route";

            }}

        }}


        // ---------------------------------------------
        // INCREASE POSITION
        // ---------------------------------------------

        progress += animationSpeed;


        if(
            progress >= 1
        )
        {{

            progress = 0;

            segmentIndex++;


            // -----------------------------------------
            // ROUTE COMPLETE
            // -----------------------------------------

            if(
                segmentIndex >=
                vehicles[0].route.length - 1
            )
            {{

                segmentIndex = 0;

                document.getElementById(
                    "vehicle-status"
                ).innerHTML =
                    "🔄 Route Restarting";

            }}

        }}

    }}


    // =====================================================
    // START LIVE TRACKING
    // =====================================================

    setInterval(
        moveVehicles,
        100
    );


    </script>

    """


    route_map.get_root().html.add_child(
        folium.Element(
            javascript
        )
    )


    # =========================================================
    # SAVE
    # =========================================================

    output_file = (
        OUTPUT_DIR /
        filename
    )

    route_map.save(
        output_file
    )


    print()
    print(
        "Live tracking map saved:"
    )

    print(
        output_file
    )


    return str(output_file)