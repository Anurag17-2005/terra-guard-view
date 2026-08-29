# Guardians Map

Build PHASE 1 of a project called "FortyGuard".

IMPORTANT:

This is the first phase of a larger geospatial decision-support application.

DO NOT build future features yet.

DO NOT add backend APIs, authentication, dashboards, AI recommendations, environmental data, temperature, AQI, or suitability calculations yet.

The only goal of Phase 1 is to create a clean, reliable, interactive California map foundation that we will build on later.

==================================================

PROJECT CONCEPT

==================================================

FortyGuard will eventually be a city intelligence and decision-support application.

The application will use a real geographic map as the base layer.

Later, external/backend data such as:

- temperature

- AQI

- carbon

- humidity

- population

- flood risk

- solar potential

- infrastructure

- suitability scores

will be displayed on top of the map as transparent visual layers.

For Phase 1, ONLY build the map foundation.

==================================================

TECHNOLOGY

==================================================

Use the simplest technology possible.

Frontend:

- React

- TypeScript

- Vite

Mapping:

- Leaflet

- react-leaflet if appropriate

Do NOT use Google Maps.

Do NOT require a paid mapping service.

Do NOT introduce unnecessary GIS libraries.

Use OpenStreetMap for the standard map view.

For satellite imagery, use a publicly accessible satellite tile source suitable for a personal learning project.

Keep the satellite provider isolated in a separate configuration so that it can easily be replaced later if needed.

==================================================

PHASE 1 REQUIREMENTS

==================================================

1. FULL SCREEN MAP

Create a full-screen interactive map.

The map should occupy the main application viewport.

The user must be able to:

- drag the map

- pan

- zoom in

- zoom out

- use mouse wheel

- click the map

- use zoom controls

The map should feel similar to a basic Google Maps interaction.

==================================================

2. CALIFORNIA INITIAL VIEW

==================================================

When the application first loads:

- show California

- center the map around California

- fit the map appropriately to California

- do not start with the entire United States

- do not start with the entire world

Use the actual California geographic boundary.

California should be the primary geographic area of the application.

Example initial center:

latitude: 36.7783

longitude: -119.4179

But prefer fitting the actual California GeoJSON bounds instead of relying only on hardcoded coordinates.

==================================================

3. CALIFORNIA BOUNDARY

==================================================

Load a real California boundary GeoJSON.

Draw the California boundary clearly.

The boundary should be visually subtle but easy to identify.

Do not manually approximate the California shape.

Use actual geographic boundary data.

The boundary should support:

- the mainland California shape

- coastline

- state border

- relevant islands if present in the dataset

==================================================

4. OUTSIDE CALIFORNIA

==================================================

The desired visual behavior is:

California remains clearly visible.

Everything outside California should be strongly darkened/masked.

The result should visually resemble:

    DARKENED AREA

    ┌──────────────────────┐

    │                      │

    │     CALIFORNIA       │

    │     FULLY VISIBLE    │

    │                      │

    └──────────────────────┘

    DARKENED AREA

Do NOT simply zoom so that California happens to fill the screen.

The user should still technically be able to navigate the map, but the area outside California should be visually de-emphasized.

Use a transparent dark overlay with California cut out.

The California area itself must remain fully visible.

The mask should work in both:

- normal map mode

- satellite mode

Do not cover California with the mask.

==================================================

5. MAP VIEW

==================================================

Create a normal geographic map view.

It should show:

- roads

- highways

- cities

- geographic features

- water

- place names where available

Use OpenStreetMap-based map tiles.

==================================================

6. SATELLITE VIEW

==================================================

Add a Map / Satellite switch.

Example:

[ Map ] [ Satellite ]

Map:

- standard geographic map

Satellite:

- satellite imagery

The satellite imagery should cover California clearly.

IMPORTANT:

Satellite imagery freshness depends on the imagery provider.

Do not claim that imagery is "real-time" or "latest" unless the provider actually guarantees this.

Keep the satellite tile URL/provider configuration isolated so it can be changed later.

==================================================

7. INFORMATION ON SATELLITE VIEW

==================================================

Satellite mode should NOT become a completely empty satellite image.

We want geographic context visible over the satellite imagery.

The satellite view should have an overlay for:

- roads

- highways

- city/place labels

- boundaries where possible

The visual hierarchy should be:

SATELLITE IMAGE

       ↓

TRANSPARENT ROADS / LABELS

       ↓

FUTURE FORTYGUARD DATA LAYERS

The roads and labels must not completely obscure the satellite imagery.

==================================================

8. MAP / SATELLITE CONTROL

==================================================

Create a simple control for switching:

Map

Satellite

Keep it visually clean.

Do not build a large dashboard yet.

The map should remain the primary UI.

==================================================

9. CLICK LOCATION

==================================================

When the user clicks anywhere on the map:

show a small popup containing:

Latitude

Longitude

Example:

Selected Location

Latitude: 36.77830

Longitude: -119.41790

Do not implement reverse geocoding yet.

Do not call any external location search API yet.

==================================================

10. COMPONENT STRUCTURE

==================================================

Keep the code modular.

Suggested structure:

src/

  components/

    Map/

      MapView.tsx

      BaseLayers.tsx

      CaliforniaBoundary.tsx

      CaliforniaMask.tsx

      MapControls.tsx

  config/

    mapConfig.ts

  data/

    california.ts

  App.tsx

  main.tsx

The exact structure can differ if there is a cleaner React architecture, but avoid putting the entire map implementation into App.tsx.

==================================================

11. MAP CONFIGURATION

==================================================

Keep tile providers configurable.

For example:

const MAP_CONFIG = {

  defaultCenter: [36.7783, -119.4179],

  defaultZoom: 6,

  streetTiles: "...",

  satelliteTiles: "...",

  attribution: {

    street: "...",

    satellite: "..."

  }

};

The goal is to make changing the tile provider later easy.

==================================================

12. FUTURE DATA LAYER ARCHITECTURE

==================================================

Do not implement environmental data yet.

However, structure the map so that future layers can easily be added.

The intended architecture is:

Base Map

   ↓

California Mask

   ↓

Roads / Labels

   ↓

FortyGuard Data Layers

   ↓

Interaction / Information UI

Future data layers may include:

Temperature

AQI

Carbon

Humidity

Population

Flood Risk

Solar Potential

Suitability

The Phase 1 code should not make adding these layers difficult later.

==================================================

13. VISUAL DESIGN

==================================================

Keep the interface minimal and professional.

The map should be the dominant element.

Do not create:

- unnecessary cards

- large sidebars

- fake analytics

- dummy charts

- fake environmental values

- fake API responses

Only create the map foundation.

Use a clean modern interface.

==================================================

14. RESPONSIVENESS

==================================================

The map should work on:

- desktop

- laptop

- tablet

Mobile optimization is not the primary focus yet, but avoid hardcoding dimensions that would break smaller screens.

==================================================

15. PERFORMANCE

==================================================

Keep Phase 1 lightweight.

Do not add unnecessary dependencies.

Do not load huge datasets.

Do not implement complicated GIS processing in the browser unless necessary.

==================================================

16. IMPORTANT IMPLEMENTATION RULE

==================================================

Do not fake functionality.

If a feature cannot be implemented reliably with the selected free/public data source, keep the architecture ready for it and explain the limitation rather than creating fake data.

==================================================

17. SUCCESS CRITERIA

==================================================

Phase 1 is complete only when:

✓ Application starts successfully

✓ California is the initial geographic focus

✓ User can drag the map

✓ User can zoom

✓ Normal map works

✓ Satellite view works

✓ Map/Satellite switching works

✓ Roads and place information remain available in satellite mode

✓ California boundary is visible

✓ Outside California is strongly darkened

✓ California itself remains unobstructed

✓ Clicking the map shows latitude/longitude

✓ Code is modular

✓ No environmental/API data has been added yet

✓ No fake data has been added

==================================================

IMPORTANT

==================================================

Build ONLY PHASE 1.

After implementation, give me:

1. A short summary of what was built.

2. The files/components created.

3. Any external map/data providers used.

4. Any limitations.

5. Any errors that need fixing.

DO NOT automatically continue to Phase 2.

Wait for my approval before making further changes.

Build a project called "FortyGuard City Intelligence".

IMPORTANT:

Build this project incrementally in PHASES 1–4.

Do not build Phase 5 decision-support/suitability features yet.

The application is a geospatial city intelligence platform.

The central UI is an interactive geographic map.

The map is the base layer.

FortyGuard environmental and temperature intelligence will be displayed as transparent visual layers on top of the map.

============================================================

CORE PRODUCT IDEA

============================================================

The application should eventually help city authorities explore geographic and environmental conditions when evaluating locations for infrastructure and urban planning.

The user should be able to:

1. Navigate a real geographic map.

2. Search for places.

3. Navigate using coordinates.

4. Explore roads, cities and places.

5. Select a location.

6. Request FortyGuard environmental/temperature data.

7. Display that data spatially on the map.

8. Inspect the values for a selected location.

The application should feel like:

REAL MAP

+

GEOGRAPHIC SEARCH

+

ENVIRONMENTAL INTELLIGENCE

Do not try to reproduce Google Maps completely.

The map only needs to provide the geographic context needed for FortyGuard intelligence.

============================================================

TECHNOLOGY PRINCIPLES

============================================================

Use a simple, maintainable architecture.

Preferred stack:

Frontend:

- React

- TypeScript

- Vite

Map:

- Leaflet

- React Leaflet

Backend/server:

- Use a lightweight server-side API layer compatible with the Lovable project.

Do not expose the FortyGuard API key in frontend JavaScript.

The FortyGuard API key must be stored in an environment variable/server secret.

Example:

FORTYGUARD_API_KEY=...

Frontend should communicate with our own server endpoints.

Example:

Browser

   ↓

/api/fortyguard/heatmap

   ↓

Server

   ↓

FortyGuard API

Never:

Browser

   ↓

FortyGuard API

   ↓

API key exposed

============================================================

PHASE 1 — MAP FOUNDATION

============================================================

Create a full-screen interactive map.

The map should:

- pan

- drag

- zoom

- zoom using mouse wheel

- have zoom controls

- support clicking

- support switching between map and satellite imagery

Initial geographic focus:

California, USA.

Initial center:

latitude: 36.7783

longitude: -119.4179

Prefer fitting the actual California boundary rather than relying only on hardcoded coordinates.

============================================================

CALIFORNIA BOUNDARY

============================================================

Load an actual California GeoJSON boundary.

Do not manually draw an approximate California shape.

Display the California boundary clearly.

California should be the primary geographic region.

Everything outside California should be visually darkened.

Desired behavior:

            DARKENED

     ┌───────────────────┐

     │                   │

     │    CALIFORNIA     │

     │    FULLY VISIBLE  │

     │                   │

     └───────────────────┘

            DARKENED

Use a transparent dark mask with a hole for California.

The mask should work with:

- normal map

- satellite view

- future FortyGuard data layers

California itself must never be covered by the outside mask.

============================================================

MAP VIEW

============================================================

Use OpenStreetMap-based tiles for the normal map.

Show:

- roads

- highways

- cities

- place names

- water

- geographic features

Keep attribution visible.

============================================================

SATELLITE VIEW

============================================================

Provide:

[ Map ] [ Satellite ]

Satellite imagery should be a separate base layer.

Do not claim satellite imagery is real-time unless the provider guarantees it.

Keep the satellite provider configurable so it can be replaced later.

Satellite view must retain geographic context.

The user should still see:

- roads

- highways

- city names

- place labels

- boundaries where possible

The visual hierarchy should be:

SATELLITE

    ↓

ROADS / LABELS

    ↓

FORTYGUARD DATA

    ↓

USER INTERACTION

============================================================

CLICK MAP

============================================================

When the user clicks the map:

show:

Selected Location

Latitude: XX.XXXXX

Longitude: XX.XXXXX

Also place a temporary marker.

Do not yet call the FortyGuard API just because the user clicked.

The API should only be called when the user explicitly requests environmental data.

============================================================

PHASE 2 — SEARCH AND NAVIGATION

============================================================

Add a search box in the upper-left area.

The search must support place-name search.

Examples:

San Francisco

Los Angeles

San Jose

Golden Gate Bridge

hospital

school

restaurant

park

The search should provide autocomplete suggestions while typing.

Example:

Search:

"San Fran"

Suggestions:

San Francisco, CA

San Francisco International Airport

San Francisco Bay

...

When the user selects a result:

1. Move/fly the map to the location.

2. Choose an appropriate zoom level.

3. Place a marker.

4. Show the location name.

5. Store the selected latitude/longitude in application state.

============================================================

SEARCH ARCHITECTURE

============================================================

Do not hardcode search results.

Use a real geocoding/place search provider suitable for a low-cost personal learning project.

Keep the provider behind a small abstraction:

geocodingService.search(query)

This will allow us to replace the provider later.

Search response should be normalized into:

{

  id: string,

  name: string,

  displayName: string,

  latitude: number,

  longitude: number,

  type?: string,

  category?: string

}

The map should only depend on this normalized structure.

============================================================

COORDINATE SEARCH

============================================================

Provide a way to enter coordinates.

Example:

37.7749, -122.4194

After submission:

- validate latitude

- validate longitude

- move map to the coordinates

- zoom in

- place marker

- show coordinates

Validation:

latitude must be between -90 and 90.

longitude must be between -180 and 180.

============================================================

REVERSE GEOCODING

============================================================

When a user clicks a location:

we should eventually be able to convert:

latitude + longitude

into:

city

state

country

place/address

Implement this through the same geocoding service abstraction.

If reverse geocoding fails, still show latitude/longitude.

============================================================

PHASE 3 — GEOGRAPHIC / POI INFORMATION

============================================================

Add basic geographic context.

Search and display places/POIs where the chosen geographic provider supports them.

Potential categories:

- restaurants

- hospitals

- schools

- parks

- landmarks

- businesses

- airports

- roads

Do not attempt to recreate Google's complete POI database.

The goal is simply to make the map geographically useful.

============================================================

POI DISPLAY

============================================================

When a search result is selected:

show a marker.

When a marker is selected:

show a small information panel.

Example:

--------------------------------

San Francisco

--------------------------------

Type:

City

Coordinates:

37.7749, -122.4194

--------------------------------

For a restaurant:

--------------------------------

Restaurant Name

--------------------------------

Category:

Restaurant

Location:

...

--------------------------------

Do not fabricate information that the geographic provider does not return.

============================================================

LOCATION DETAIL PANEL

============================================================

Create a reusable LocationDetails component.

It should eventually support:

Basic geographic information

+

FortyGuard environmental information

For now Phase 3 should only show geographic information.

Structure it so Phase 4 can add:

Temperature

AQI

Humidity

etc.

============================================================

PHASE 4 — FORTYGUARD API INTEGRATION

============================================================

Now connect the application to the FortyGuard API.

The FortyGuard API uses API-key authentication.

Every request requires:

api-key: YOUR_API_KEY

The key must NEVER be exposed in frontend code.

Store it as a server environment variable.

Example:

FORTYGUARD_API_KEY

============================================================

FORTYGUARD API WORKFLOW

============================================================

The FortyGuard API uses asynchronous activities.

The general workflow is:

1. Submit request.

2. Receive activity_id.

3. Poll status endpoint.

4. Wait while status is Processing.

5. Stop when Completed.

6. Read result.

7. Display result.

Example:

POST

https://api.fortyguard.com/v1/heatmap

Response:

{

  "error": false,

  "status_code": 200,

  "message": "Heatmap Submitted Successfully",

  "data": {

    "activity_id": "UUID"

  }

}

Then:

GET

https://api.fortyguard.com/v1/status/{activity_id}

Continue bounded polling while status is Processing.

When:

status = Completed

read:

data.result

If:

status = Failed

stop polling and show a meaningful error.

Do not poll forever.

Use bounded polling and reasonable delays.

============================================================

FORTYGUARD HEATMAP

============================================================

The most important Phase 4 endpoint is:

POST

https://api.fortyguard.com/v1/heatmap

This endpoint generates high-resolution thermal maps.

The heatmap accepts a GeoJSON polygon defining the area of interest.

The request supports:

polygon_aoi

date_time

granularity

analytic_type

threshold

direction

The heatmap can return:

map_data

stats_data

map_data is a GeoJSON FeatureCollection containing polygon tiles.

This is extremely important.

The frontend should NOT convert the heatmap into fake points.

The API already gives us geographic polygon tiles.

Render those GeoJSON polygons directly on the Leaflet map.

============================================================

HEATMAP REQUEST

============================================================

Example conceptual request:

{

  "polygon_aoi": {

    "type": "FeatureCollection",

    "features": [

      {

        "type": "Feature",

        "properties": {},

        "geometry": {

          "type": "Polygon",

          "coordinates": [

            [

              [lng, lat],

              [lng, lat],

              [lng, lat],

              [lng, lat],

              [lng, lat]

            ]

          ]

        }

      }

    ]

  },

  "date_time": {

    "start_date": "2024-07-15",

    "start_time": "14:00",

    "filter_type": 1

  },

  "granularity": 100,

  "analytic_type": "tcm"

}

For Phase 4, use:

analytic_type = "tcm"

because this represents the temperature snapshot.

Do not invent the returned temperature values.

============================================================

HEATMAP GRANULARITY

============================================================

The API supports spatial resolutions:

60m

80m

100m

Make granularity configurable.

Default:

100

Do not automatically use a higher resolution unless requested.

============================================================

HEATMAP TIME

============================================================

Support the documented date_time structure.

filter_type:

1 = Single Hour

2 = Range of Hours

3 = Single Day

4 = Range of Days

For the initial UI, keep the simplest option:

Single Hour.

Example:

Date:

2026-08-28

Time:

14:00

Later we can expose the other modes.

============================================================

IMPORTANT DATE RULE

============================================================

The FortyGuard API supports dates from:

2019-01-01

through:

12 hours past the current time

according to the API documentation.

Validate dates before submitting.

Do not silently send invalid dates.

============================================================

HEATMAP RESULT

============================================================

A completed heatmap response has the structure:

{

  "error": false,

  "status_code": 200,

  "message": "Completed",

  "data": {

    "activity_id": "UUID",

    "status": "Completed",

    "result": {

      "map_data": {},

      "stats_data": {}

    }

  }

}

map_data is:

GeoJSON FeatureCollection

containing polygon tiles.

Render:

result.map_data

as a Leaflet GeoJSON layer.

============================================================

TRANSPARENT TEMPERATURE SURFACE

============================================================

This is one of the most important UI requirements.

The temperature map should NOT look like solid blocks covering the map.

The polygons should be transparent/semi-transparent.

The underlying:

- roads

- buildings

- satellite imagery

- labels

must remain visible.

Conceptually:

BASE MAP

     ↓

CALIFORNIA

     ↓

TRANSPARENT TEMPERATURE SURFACE

     ↓

ROADS / LABELS

     ↓

USER INTERACTION

Use a visually smooth temperature color scale.

Do not hardcode arbitrary temperature values.

Use the temperature value contained in each GeoJSON feature's properties.

If the API returns:

feature.properties.temperature

use that.

If the exact property name differs, inspect the real response and create a normalized mapping layer.

Do not invent property names.

============================================================

TEMPERATURE COLORING

============================================================

Create a reusable function:

getTemperatureColor(value)

It should map the actual API temperature value to a color.

The layer should use:

fillColor

fillOpacity

weight

color

Keep opacity low enough that the base map remains visible.

Example conceptual styling:

{

  fillColor: getTemperatureColor(value),

  fillOpacity: 0.35,

  weight: 0

}

Do not use opaque polygons.

============================================================

TEMPERATURE LEGEND

============================================================

When the temperature layer is enabled, display a small legend.

Example:

Temperature

Cool ───────────── Hot

20°C       25°C       30°C       35°C       40°C

The legend should be generated from the actual displayed data where possible.

Do not pretend these values are always the actual minimum/maximum.

============================================================

TEMPERATURE HOVER

============================================================

When hovering over a heatmap tile:

temporarily highlight the polygon.

Show a tooltip containing the actual temperature value.

Example:

Temperature

32.4°C

Do not display fake values.

============================================================

TEMPERATURE CLICK

============================================================

When clicking a heatmap tile:

show the location details panel.

Example:

--------------------------------

FORTYGUARD ENVIRONMENT

--------------------------------

Temperature

32.4 °C

Coordinates

37.7749, -122.4194

Activity

UUID

Status

Completed

--------------------------------

This panel will later contain AQI and other parameters.

============================================================

FORTYGUARD ENVIRONMENTAL PARAMETERS

============================================================

Also prepare the architecture for:

POST

https://api.fortyguard.com/v1/env_params

This endpoint provides environmental parameters for a coordinate and time period.

Required:

latitude

longitude

temperature

date_time

Optional:

analysis

The API can return parameters including:

heat_index_celsius

apparent_temperature_celsius

wet_bulb_temperature_celsius

relative_humidity_percent

precipitation_mm

cloud_cover_octas

elevation

Air quality:

air_quality:idx

air_quality_pm2p5:idx

air_quality_pm10:idx

air_quality_no2:idx

aqi_us_co

air_quality_o3:idx

air_quality_so2:idx

Gases:

methane_ppb

co2_ppm

Solar:

solar_irradiance

Do not necessarily display every field yet.

Create a normalized environmental data model.

Example:

{

  temperature: number | null,

  heatIndex: number | null,

  apparentTemperature: number | null,

  wetBulbTemperature: number | null,

  humidity: number | null,

  precipitation: number | null,

  cloudCover: number | null,

  aqi: number | null,

  pm25: number | null,

  pm10: number | null,

  no2: number | null,

  ozone: number | null,

  co: number | null,

  so2: number | null,

  methane: number | null,

  co2: number | null,

  solar: object | null

}

IMPORTANT:

The API can return JSON null for unavailable numeric values.

null means unavailable.

Never convert null to zero.

============================================================

ENVIRONMENTAL API WORKFLOW

============================================================

Use the same activity workflow:

POST env_params

       ↓

activity_id

       ↓

GET /v1/status/{activity_id}

       ↓

Processing

       ↓

Completed

       ↓

result

Normalize result

       ↓

Location Details UI

============================================================

BASIC ENVIRONMENT PANEL

============================================================

When a user selects a location, the UI should eventually support:

--------------------------------

Environmental Conditions

--------------------------------

Temperature       32.4 °C

AQI               61

Humidity          54 %

Heat Index        35.2 °C

Precipitation     0 mm

Solar             ...

Only show values that actually exist.

If a value is null:

display:

Unavailable

Do NOT display:

0

============================================================

API SERVICE ARCHITECTURE

============================================================

Create a dedicated service layer.

Example:

src/services/fortyguard/

  client.ts

  heatmap.ts

  environmental.ts

  status.ts

  types.ts

Example:

fortyguardHeatmap.create(request)

fortyguardStatus.get(activityId)

fortyguardEnvironmental.get(request)

The UI must not contain raw API request logic.

============================================================

SERVER API ARCHITECTURE

============================================================

Create server-side routes such as:

POST /api/fortyguard/heatmap

GET /api/fortyguard/status/:activityId

POST /api/fortyguard/environmental

The server should:

1. validate request

2. add API key

3. call FortyGuard

4. return normalized response

The browser should never receive the FortyGuard API key.

============================================================

ERROR HANDLING

============================================================

Handle these documented cases:

400 / 422

Invalid request

401

Missing/invalid API key

403

Insufficient plan access

404

Activity not found

429

Rate limit exceeded

500

Server-side error

Processing

Continue bounded polling

Completed

Read result

Failed

Stop polling

Show user-friendly messages.

Do not expose internal API keys or secrets in error messages.

============================================================

LOADING STATES

============================================================

Because FortyGuard operations are asynchronous, the UI must clearly show:

Submitting...

Processing...

Completed

Example:

--------------------------------

Temperature Analysis

--------------------------------

◉ Request submitted

◉ Processing FortyGuard data...

○ Preparing map layer

--------------------------------

When completed:

✓ Temperature data ready

============================================================

DO NOT BLOCK THE ENTIRE MAP

============================================================

While FortyGuard is processing:

The user should still be able to:

- move the map

- zoom

- switch map/satellite

- search

- inspect existing locations

Do not freeze the entire application.

============================================================

LAYER MANAGEMENT

============================================================

Create a layer system.

Initial layers:

Base Map

Satellite

Roads / Labels

California Boundary

Temperature

Prepare for future layers:

AQI

Humidity

Carbon

Solar

Flood Risk

Population

Suitability

Example conceptual state:

layers = {

  temperature: true,

  aqi: false,

  humidity: false,

  carbon: false

}

Only implement the actual temperature layer in Phase 4.

============================================================

DATA FLOW

============================================================

The final Phase 4 architecture should look like:

USER

 |

 | search / click / choose analysis

 ↓

REACT UI

 |

 ↓

MAP

 |

 +---- Base Map

 |

 +---- Satellite

 |

 +---- Roads / Labels

 |

 +---- California Mask

 |

 +---- FortyGuard Temperature GeoJSON

 |

 ↓

SERVER API

 |

 ↓

FORTYGUARD API

 |

 ↓

activity_id

 |

 ↓

status polling

 |

 ↓

Completed result

 |

 ↓

GeoJSON + environmental data

 |

 ↓

MAP VISUALIZATION

============================================================

IMPORTANT GEOSPATIAL RULE

============================================================

GeoJSON coordinates are normally:

[longitude, latitude]

Do not accidentally reverse them.

Leaflet uses:

[latitude, longitude]

when creating markers or map coordinates.

Create explicit conversion helpers where necessary.

============================================================

UI STRUCTURE

============================================================

Create a clean application shell.

Top-left:

FortyGuard logo/name

Search bar

Coordinate search option

Top-right:

Map / Satellite control

Layer control

Map controls

Bottom-left or right:

Legend when a data layer is active.

Right-side:

Location Details panel when a location is selected.

The map should remain the dominant part of the screen.

Do not create a huge dashboard.

============================================================

DESIGN PRINCIPLES

============================================================

Visual style:

- clean

- modern

- professional

- minimal

- map-first

- suitable for an urban planning/intelligence application

Avoid:

- excessive gradients

- excessive cards

- fake analytics

- fake data

- unnecessary animations

- huge navigation bars

The map is the product.

============================================================

WHAT NOT TO BUILD YET

============================================================

Do NOT build:

- suitability scoring

- school recommendation

- hospital recommendation

- solar recommendation

- AI recommendations

- user authentication

- complex analytics dashboard

- reports

- PDF generation UI

- comparison engine

- forecasting UI

- advanced time slider

Those belong to later phases.

============================================================

SUCCESS CRITERIA

============================================================

Phase 1:

✓ California map

✓ Map/Satellite

✓ California boundary

✓ Outside California darkened

✓ Roads and labels

✓ Pan/zoom

✓ Click coordinates

Phase 2:

✓ Place search

✓ Autocomplete

✓ Search result navigation

✓ Coordinate search

✓ Reverse geocoding

Phase 3:

✓ POI/location information

✓ Location detail panel

✓ Restaurants/schools/hospitals/parks where provider data supports them

✓ Reusable location architecture

Phase 4:

✓ Secure server-side FortyGuard integration

✓ Heatmap submission

✓ activity_id handling

✓ bounded status polling

✓ Completed/Failed handling

✓ GeoJSON heatmap rendering

✓ Transparent temperature surface

✓ Temperature legend

✓ Temperature hover

✓ Temperature click

✓ Environmental API architecture

✓ Environmental data normalization

✓ null values handled correctly

✓ Loading/error states

============================================================

IMPLEMENTATION STRATEGY

============================================================

Implement the project in this order:

STEP 1:

Build Phase 1 map.

STEP 2:

Verify the map works.

STEP 3:

Add Phase 2 search/navigation.

STEP 4:

Verify search and coordinate navigation.

STEP 5:

Add Phase 3 geographic/POI information.

STEP 6:

Verify location details.

STEP 7:

Add Phase 4 server-side FortyGuard integration.

STEP 8:

Test the actual FortyGuard heatmap request.

STEP 9:

Render the returned GeoJSON.

STEP 10:

Add transparent temperature visualization.

STEP 11:

Add environmental parameter integration architecture.

Do not skip directly to later functionality.

============================================================

VERY IMPORTANT DEVELOPMENT RULE

============================================================

Do not create fake API responses just to make the UI look finished.

If the real FortyGuard API cannot be called because the API key is missing:

show a clear configuration message.

For development only, you may create a clearly isolated mock adapter, but it must NEVER be confused with real FortyGuard data.

The real API integration must remain the primary implementation.

============================================================

FINAL REQUIREMENT

============================================================

Build Phases 1–4 as one coherent application, but maintain clear separation between each phase internally.

Do not build Phase 5.

After implementation, provide:

1. Architecture overview.

2. File structure.

3. Environment variables required.

4. Map provider used.

5. Geocoding provider used.

6. FortyGuard endpoints integrated.

7. How the asynchronous activity workflow works.

8. How GeoJSON heatmap data is rendered.

9. How to run the application locally.

10. Any limitations or provider/API constraints.

Most importantly:

KEEP THE APPLICATION SIMPLE.

This is a personal learning project.

Prefer understandable code over over-engineered architecture.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d01ddd45-aee5-4377-8e54-e7a8132a8f38).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
