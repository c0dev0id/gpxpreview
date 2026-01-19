/*
 * Copyright by SoftCreatR.dev.
 *
 * License: https://softcreatr.dev/license-terms
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * The above copyright notice and this disclaimer notice shall be included in all
 * copies or substantial portions of the Software.
 */
define(["require", "exports", "tslib", "WoltLabSuite/Core/Core", "WoltLabSuite/Core/Language"], function (require, exports, tslib_1, Core, Language_1) {
    "use strict";
    Core = tslib_1.__importStar(Core);
    /**
     * Gpx file parser for the Google Maps API v3.
     *
     * Based on the original work by Kaz Okuda
     * http://notions.okuda.ca/geotagging/projects-im-working-on/gpx-viewer/
     */
    const _availableIcons = [
        "airport",
        "amusement_park",
        "anchor",
        "anchor_prohibited",
        "animal_tracks",
        "atv",
        "bait_and_tackle",
        "ball_park",
        "bank",
        "bank_euro",
        "bank_pound",
        "bank_yen",
        "bar",
        "beach",
        "beacon",
        "bell",
        "big_game",
        "bike_trail",
        "blind",
        "block_blue",
        "block_green",
        "block_red",
        "block_yellow",
        "blood_trail",
        "boat_ramp",
        "bowling",
        "bridge",
        "Brush Pile",
        "Building",
        "buoy_dark",
        "buoy_white",
        "campground",
        "car",
        "car_rental",
        "car_repair",
        "cemetery",
        "church",
        "circle_blue",
        "circle_green",
        "circle_red",
        "circle_with_x",
        "circle_yellow",
        "city_(capitol)",
        "city_(large)",
        "city_(medium)",
        "city_(small)",
        "city_hall",
        "civil",
        "coast_guard",
        "controlled_area",
        "convenience_store",
        "cover",
        "covey",
        "crossing",
        "dam",
        "danger_area",
        "department_store",
        "diamond_blue",
        "diamond_green",
        "diamond_red",
        "diamond_yellow",
        "diver_down_flag_1",
        "diver_down_flag_2",
        "dock",
        "dog_pointing",
        "dog_running",
        "dog_sitting",
        "dog_treed",
        "dog_unknown",
        "dot_white",
        "drinking_water",
        "dropoff",
        "exit",
        "exposed_wreck",
        "fast_food",
        "favorite",
        "ferry",
        "fishing_area",
        "fishing_area_1",
        "fishing_area_2",
        "fishing_area_3",
        "fishing_area_4",
        "fishing_area_5",
        "fishing_area_6",
        "fishing_area_7",
        "fishing_area_8",
        "fishing_area_9",
        "fishing_hot_spot_facility",
        "fish_attractor",
        "fitness_center",
        "flag",
        "flag_blue",
        "flag_green",
        "flag_red",
        "flag_yellow",
        "food_source",
        "forest",
        "funicular",
        "furbearer",
        "gas_station",
        "geocache",
        "geocache_found",
        "ghost_town",
        "glider_area",
        "golf_course",
        "ground_transportation",
        "heliport",
        "horn",
        "hospital_euro",
        "hump",
        "hunting_area",
        "ice_skating",
        "information",
        "laydown",
        "ledge",
        "letterbox_cache",
        "levee",
        "library",
        "light",
        "lily_pads",
        "live_theater",
        "lodge",
        "lodging",
        "man_overboard",
        "marina",
        "medical_facility",
        "mile_marker",
        "military",
        "mine",
        "movie_theater",
        "multi-cache",
        "museum",
        "navaid_amber",
        "navaid_black",
        "navaid_blue",
        "navaid_green-red",
        "navaid_green-white",
        "navaid_green",
        "navaid_orange",
        "navaid_red-green",
        "navaid_red-white",
        "navaid_red",
        "navaid_violet",
        "navaid_white-green",
        "navaid_white-red",
        "navaid_white",
        "no_wake_zone",
        "oil_field",
        "oval_blue",
        "oval_green",
        "oval_red",
        "oval_yellow",
        "parachute_area",
        "park",
        "parking_euro",
        "parking_euro_pay",
        "parking_pay",
        "pharmacy",
        "picnic_area",
        "pin_blue",
        "pin_green",
        "pin_red",
        "pin_yellow",
        "pixel",
        "pizza",
        "police_station",
        "post_office",
        "private_field",
        "puzzle_cache",
        "radio_beacon",
        "railway",
        "recommended_anchor",
        "rectangle_blue",
        "rectangle_green",
        "rectangle_red",
        "rectangle_yellow",
        "reef",
        "residence",
        "restaurant",
        "restricted_area",
        "restroom",
        "rocks",
        "rv_park",
        "sad_face",
        "scales",
        "scenic_area",
        "school",
        "seaplane_base",
        "shipwreck",
        "shopping_center",
        "short_tower",
        "shower",
        "skiing_area",
        "ski_resort",
        "skull_and_crossbones",
        "small_game",
        "soft_field",
        "square_blue",
        "square_green",
        "square_red",
        "square_yellow",
        "stadium",
        "stop",
        "stump",
        "summit",
        "swimming_area",
        "tall_tower",
        "telephone",
        "toll_booth",
        "tracback_point",
        "trail_head",
        "treed_quarry",
        "tree_stand",
        "triangle_bue",
        "triangle_green",
        "triangle_red",
        "triangle_yellow",
        "truck",
        "truck_Stop",
        "tunnel",
        "ultralight_area",
        "underwater_grass",
        "underwater_tree",
        "upland_game",
        "waterfowl",
        "water_hydrant",
        "water_source",
        "waypoint",
        "waypoint_flag",
        "weed_bed",
        "winery",
        "wrecker",
        "zoo",
        "ape",
        "cito",
        "earth",
        "event",
        "lab",
        "letterbox",
        "locationless",
        "multi",
        "mystery",
        "traditional",
        "unknown",
        "virtual",
        "webcam",
        "wherigo",
    ];
    class GpxParser {
        _options = {
            trackColor: "#ff0000",
            trackWidth: 5,
            minTrackpointDelta: 0.001,
        };
        _xmlDoc = null;
        _mapElement = null;
        _polylinePoints = null;
        // Element storage for modifications
        _markers = {
            trackPoints: [],
            waypoints: [],
            routePoints: []
        };
        _polylines = {
            tracks: [],
            routes: []
        };
        // Visibility and style settings
        _settings = {
            showTrackPoints: true,
            showWaypoints: true,
            showRoutePoints: true,
            showTracks: true,
            showRoutes: true,
            showLabels: true,
            customIcon: null,
            trackColor: "#ff0000",
            trackWidth: 5
        };
        /**
         * Initialize with options.
         */
        init(xmlDoc, mapElement, options = {}) {
            Core.extend(this._options, options);
            this._xmlDoc = xmlDoc;
            this._mapElement = mapElement;
            this._polylinePoints = null;
        }
        /**
         * Enable clickable track information.
         */
        setTrackClickable() {
            this._polylinePoints = [];
        }
        findNearestPoint(lon, lat) {
            if (!this._polylinePoints || this._polylinePoints.length === 0) {
                return null;
            }
            let nearest = this._polylinePoints[0];
            let minDist = (lon - Number(nearest[0])) ** 2 + (lat - Number(nearest[1])) ** 2;
            for (const point of this._polylinePoints) {
                const dist = (lon - Number(point[0])) ** 2 + (lat - Number(point[1])) ** 2;
                if (dist < minDist) {
                    minDist = dist;
                    nearest = point;
                }
            }
            return nearest;
        }
        /**
         * Creates markers for a given point.
         *
         * Supports standard route markers and Geocaching
         */
        async createMarker(point, markerType = 'trackPoints') {
            let iconBase = WCF_PATH + "images/markerClusterer/";
            const pointElements = point.getElementsByTagName("html");
            const geoCacheElements = point.getElementsByTagName("groundspeak:cache");
            const lon = parseFloat(point.getAttribute("lon") ?? "0");
            const lat = parseFloat(point.getAttribute("lat") ?? "0");
            const map = await this._mapElement.getMap();
            let html = "";
            let icon = "";
            // Create marker depending on the given marker type
            if (geoCacheElements.length) {
                const cacheData = {};
                const attributeData = {};
                const children = geoCacheElements[0].childNodes;
                const attributes = geoCacheElements[0].attributes;
                for (let i = 0; i < attributes.length; i += 1) {
                    attributeData[attributes[i].nodeName] = attributes[i].nodeValue ?? "";
                }
                if (!attributeData.cpWPT)
                    return;
                for (let i = 0; i < children.length; i += 1) {
                    cacheData[children[i].nodeName.split(":")[1]] = children[i].textContent ?? "";
                }
                html =
                    "<strong><a href='https://www.geocaching.com/seek/cache_details.aspx?wp=" +
                        attributeData.cpWPT +
                        "' target='_blank' rel='noopener'>" +
                        cacheData.name +
                        "</a></strong><br><br>";
                if (cacheData.state) {
                    html += (0, Language_1.getPhrase)("wcf.map.geoc.state") + ": " + cacheData.state + "<br>";
                }
                if (cacheData.type) {
                    icon = cacheData.type.split(" ")[0].split("-")[0].toLowerCase();
                    html += (0, Language_1.getPhrase)("wcf.map.geoc.type") + ": " + cacheData.type + "<br>";
                }
                if (cacheData.difficulty) {
                    html += (0, Language_1.getPhrase)("wcf.map.geoc.difficulty") + ": " + cacheData.difficulty + "<br>";
                }
                html += (0, Language_1.getPhrase)("wcf.map.lat") + ": " + lat + "<br>";
                html += (0, Language_1.getPhrase)("wcf.map.lon") + ": " + lon + "<br>";
                iconBase += "geocaching/";
            }
            else {
                if (pointElements.length > 0) {
                    const firstPoint = pointElements.item(0);
                    if (firstPoint) {
                        for (let i = 0; i < firstPoint.childNodes.length; i += 1) {
                            html += firstPoint.childNodes[i].nodeValue ?? "";
                        }
                    }
                }
                else {
                    const childData = {};
                    let linkNode = null;
                    if (point.hasChildNodes()) {
                        const children = point.childNodes;
                        for (let i = 0; i < children.length; i += 1) {
                            // Ignore empty nodes
                            if (children[i].nodeType !== 1 || children[i].firstChild === null) {
                                continue;
                            }
                            if (children[i].nodeName.toLowerCase() === "link") {
                                linkNode = children[i];
                            }
                            childData[children[i].nodeName.toLowerCase()] = children[i].firstChild.nodeValue ?? "";
                        }
                    }
                    if (childData.sym) {
                        icon = childData.sym.replace(", ", "_").replace(" ", "_").toLowerCase();
                    }
                    if (childData.name) {
                        html = "<strong>" + childData.name + "</strong><br><br>";
                    }
                    else {
                        html = "<strong>" + (0, Language_1.getPhrase)("wcf.map." + point.nodeName) + "</strong><br><br>";
                        if (point.nodeName === "trkpt") {
                            icon = "pixel";
                        }
                    }
                    if (childData.ele && parseInt(childData.ele, 10) !== 0) {
                        html += (0, Language_1.getPhrase)("wcf.map.ele") + ": " + childData.ele + "m<br>";
                    }
                    if (childData.time) {
                        html += (0, Language_1.getPhrase)("wcf.map.time") + ": " + this.msToTime(new Date(), new Date(childData.time)) + "<br>";
                    }
                    html += (0, Language_1.getPhrase)("wcf.map.lat") + ": " + lat + "<br>";
                    html += (0, Language_1.getPhrase)("wcf.map.lon") + ": " + lon + "<br>";
                    if (childData.desc) {
                        html += "<br><hr />" + childData.desc + "</strong><hr />";
                    }
                    // link or image
                    if (linkNode) {
                        let isImage = false;
                        const linkURL = linkNode.getAttribute("href") ?? "";
                        let linkName = "";
                        if (linkNode.hasChildNodes()) {
                            const linkAttributes = linkNode.childNodes;
                            for (let i = 0; i < linkAttributes.length; i += 1) {
                                if (linkAttributes[i].nodeName.toLowerCase() === "text") {
                                    linkName = linkAttributes[i].firstChild?.nodeValue ?? "";
                                }
                                if (linkAttributes[i].nodeName.toLowerCase() === "type") {
                                    const linkType = linkAttributes[i].firstChild?.nodeValue?.toLowerCase();
                                    if (linkType && ["image/jpeg", "image/png", "image/gif"].indexOf(linkType) > -1) {
                                        isImage = true;
                                    }
                                }
                            }
                        }
                        if (isImage) {
                            html +=
                                "<br><a href='" +
                                    linkURL +
                                    "' target='_blank' rel='noopener'><img src='" +
                                    linkURL +
                                    "' alt='" +
                                    (linkName.length ? linkName : "") +
                                    "' style='max-height:100px' /></a><br>";
                        }
                        else {
                            html +=
                                "<br><a href='" +
                                    linkURL +
                                    "' target='_blank' rel='noopener'>" +
                                    (linkName.length ? linkName : "Link") +
                                    "</a>";
                        }
                    }
                    html +=
                        "<br><a href='https://maps.google.com/maps?q=" +
                            lat +
                            "," +
                            lon +
                            "&z=" +
                            map.getZoom() +
                            "' target='_blank' rel='noopener'>" +
                            (0, Language_1.getPhrase)("wcf.map.display") +
                            "</a><br>";
                    iconBase += "garmin/";
                }
            }
            // Use custom icon if set, otherwise use default logic
            let finalIcon = icon.length && _availableIcons.indexOf(icon) > -1 ? icon : "pin_blue";
            if (this._settings.customIcon && _availableIcons.indexOf(this._settings.customIcon) > -1) {
                finalIcon = this._settings.customIcon;
            }
            const markerIcon = iconBase + finalIcon + ".webp";

            // Determine visibility based on marker type
            let visible = true;
            if (markerType === 'trackPoints') {
                visible = this._settings.showTrackPoints;
            } else if (markerType === 'waypoints') {
                visible = this._settings.showWaypoints;
            } else if (markerType === 'routePoints') {
                visible = this._settings.showRoutePoints;
            }

            const marker = new google.maps.Marker({
                map: visible ? map : null,
                position: new google.maps.LatLng(lat, lon),
                icon: markerIcon,
            });

            // Show label based on settings
            if (this._settings.showLabels && html) {
                const infoWindow = new google.maps.InfoWindow({
                    content: html,
                });
                marker.addListener("click", () => {
                    infoWindow.open(map, marker);
                });

                // Store marker with metadata
                this._markers[markerType].push({
                    marker,
                    infoWindow,
                    visible,
                    type: markerType
                });

                return {
                    marker,
                    infowindow: infoWindow,
                };
            } else {
                // Store marker without infoWindow
                this._markers[markerType].push({
                    marker,
                    infoWindow: null,
                    visible,
                    type: markerType
                });

                return {
                    marker,
                    infowindow: null,
                };
            }
        }
        /**
         * Adds a track to the map.
         */
        async addTrackToMap(track, color, width) {
            const segments = track.getElementsByTagName("trkseg");
            const result = [];
            for (let i = 0; i < segments.length; i += 1) {
                result.push(await this.addLineToMap(segments[i], color, width, "trkpt"));
            }
            return result;
        }
        /**
         * Adds a polyline to the map.
         */
        async addLineToMap(route, color, width, elemName, polylineType = 'tracks') {
            const routePoints = route.getElementsByTagName(elemName);
            const map = await this._mapElement.getMap();
            if (routePoints.length === 0) {
                return;
            }
            const points = [];
            // process first point
            let lastLon = parseFloat(routePoints[0].getAttribute("lon") ?? "0");
            let lastLat = parseFloat(routePoints[0].getAttribute("lat") ?? "0");
            let latLng = new google.maps.LatLng(lastLat, lastLon);
            points.push(latLng);
            for (let i = 0; i < routePoints.length; i += 1) {
                const lon = parseFloat(routePoints[i].getAttribute("lon") ?? "0");
                const lat = parseFloat(routePoints[i].getAttribute("lat") ?? "0");
                const name = routePoints[i].getElementsByTagName("name").item(0)?.textContent ?? "";
                const desc = routePoints[i].getElementsByTagName("desc").item(0)?.textContent ?? "";
                const ele = routePoints[i].getElementsByTagName("ele").item(0)?.textContent ?? "";
                const timeNode = routePoints[i].getElementsByTagName("time").item(0);
                const time = timeNode ? this.msToTime(new Date(), new Date(timeNode.textContent ?? "")) : "";
                // Verify that this is far enough away from the last point to be used.
                const latDiff = lat - lastLat;
                const lonDiff = lon - lastLon;
                if (Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) > this._options.minTrackpointDelta) {
                    lastLon = lon;
                    lastLat = lat;
                    latLng = new google.maps.LatLng(lat, lon);
                    points.push(latLng);
                    if (this._polylinePoints) {
                        this._polylinePoints.push([lon, lat, ele, time, name, desc]);
                    }
                }
                // Pass marker type based on element name
                const markerType = elemName === 'wpt' ? 'waypoints' : (elemName === 'rtept' ? 'routePoints' : 'trackPoints');
                await this.createMarker(routePoints[i], markerType);
            }

            // Determine visibility based on polyline type
            let visible = polylineType === 'tracks' ? this._settings.showTracks : this._settings.showRoutes;

            // Use settings color and width if available
            const finalColor = this._settings.trackColor || color;
            const finalWidth = this._settings.trackWidth || width;

            const polyline = new google.maps.Polyline({
                path: points,
                strokeColor: finalColor,
                strokeWeight: finalWidth,
                map: visible ? map : null,
            });

            // Store polyline with metadata
            this._polylines[polylineType].push({
                polyline,
                visible,
                type: polylineType
            });
            if (this._polylinePoints) {
                const infoWindow = new google.maps.InfoWindow({});
                google.maps.event.addListener(polyline, "click", async (event) => {
                    const nearest = this.findNearestPoint(event.latLng.lng(), event.latLng.lat());
                    if (!nearest) {
                        return;
                    }
                    const latlng = { lat: Number(nearest[1]), lng: Number(nearest[0]) };
                    let html = "";
                    const address = await this.getAddress(latlng);
                    if (address) {
                        html += "<strong>" + address + "</strong><br><br>";
                    }
                    if (nearest[2]) {
                        html += (0, Language_1.getPhrase)("wcf.map.ele") + ": " + nearest[2] + "m<br>";
                    }
                    if (nearest[3]) {
                        html += (0, Language_1.getPhrase)("wcf.map.time") + ": " + nearest[3] + "<br>";
                    }
                    html += (0, Language_1.getPhrase)("wcf.map.lat") + ": " + nearest[1] + "<br>";
                    html += (0, Language_1.getPhrase)("wcf.map.lon") + ": " + nearest[0] + "<br>";
                    infoWindow.setPosition(new google.maps.LatLng(latlng.lat, latlng.lng));
                    infoWindow.setContent(html);
                    infoWindow.open(map);
                });
            }
            return polyline;
        }
        /**
         * Center and zoom the map.
         */
        async centerAndZoom(trackSegment, zoomLevel) {
            const pointList = ["trkpt", "rtept", "wpt"];
            let minLat = 0;
            let maxLat = 0;
            let minLon = 0;
            let maxLon = 0;
            for (let pointtype = 0; pointtype < pointList.length; pointtype += 1) {
                // Center the map and zoom on the given segment.
                const trackpoints = trackSegment.getElementsByTagName(pointList[pointtype]);
                // If the min and max are uninitialized then initialize them.
                if (trackpoints.length > 0 && minLat === maxLat && minLat === 0) {
                    minLat = parseFloat(trackpoints[0].getAttribute("lat") ?? "0");
                    maxLat = parseFloat(trackpoints[0].getAttribute("lat") ?? "0");
                    minLon = parseFloat(trackpoints[0].getAttribute("lon") ?? "0");
                    maxLon = parseFloat(trackpoints[0].getAttribute("lon") ?? "0");
                }
                for (let i = 0; i < trackpoints.length; i += 1) {
                    const lon = parseFloat(trackpoints[i].getAttribute("lon") ?? "0");
                    const lat = parseFloat(trackpoints[i].getAttribute("lat") ?? "0");
                    if (lon < minLon) {
                        minLon = lon;
                    }
                    if (lon > maxLon) {
                        maxLon = lon;
                    }
                    if (lat < minLat) {
                        minLat = lat;
                    }
                    if (lat > maxLat) {
                        maxLat = lat;
                    }
                }
            }
            const map = await this._mapElement.getMap();
            if (minLat === maxLat && minLat === 0) {
                map.setCenter(new google.maps.LatLng(49.327667, -122.942333), zoomLevel);
                return;
            }
            // Center around the middle of the points
            const centerLon = (maxLon + minLon) / 2;
            const centerLat = (maxLat + minLat) / 2;
            const boundingBox = new google.maps.LatLngBounds(new google.maps.LatLng(minLat, minLon), new google.maps.LatLng(maxLat, maxLon));
            map.fitBounds(boundingBox);
            map.setCenter(new google.maps.LatLng(centerLat, centerLon));
            if (zoomLevel !== -1) {
                map.setZoom(zoomLevel);
            }
        }
        /**
         * Adds trackpoints to the map.
         */
        async addTrackPointsToMap() {
            const tracks = this._xmlDoc.documentElement.getElementsByTagName("trk");
            const results = [];
            for (let i = 0; i < tracks.length; i += 1) {
                results.push(await this.addTrackToMap(tracks[i], this._options.trackColor, this._options.trackWidth));
            }
            return results;
        }
        /**
         * Adds waypoints to the map.
         */
        async addWaypointsToMap() {
            const waypoints = this._xmlDoc.documentElement.getElementsByTagName("wpt");
            const results = [];
            for (let i = 0; i < waypoints.length; i += 1) {
                results.push(await this.createMarker(waypoints[i], 'waypoints'));
            }
            return results;
        }
        /**
         * Adds route points (and/or poly lines) to the map.
         */
        async addRoutePointsToMap() {
            const routes = this._xmlDoc.documentElement.getElementsByTagName("rte");
            const results = [];
            for (let i = 0; i < routes.length; i += 1) {
                results.push(await this.addLineToMap(routes[i], this._options.trackColor, this._options.trackWidth, "rtept", 'routes'));
            }
            return results;
        }
        /**
         * Adds route points (and/or poly lines) to the map.
         */
        async getAddress(latlng) {
            const findResult = function (results, name) {
                const result = results.find(function (obj) {
                    return obj.types[0] === name;
                });
                return result ? result.short_name : null;
            };
            try {
                const geocoder = await this._mapElement.getGeocoder();
                const response = await geocoder.geocode({ location: latlng });
                const results = response.results;
                if (results[0]) {
                    const addrComp = results[0].address_components;
                    const street = findResult(addrComp, "route");
                    const number = findResult(addrComp, "street_number");
                    const city = findResult(addrComp, "locality");
                    if (street !== null && number !== null) {
                        return street + " " + number + ", " + city;
                    }
                    return addrComp[0].long_name;
                }
                return null;
            }
            catch {
                // something went wrong or we got no address
                return null;
            }
        }
        /**
         * Returns the time difference between two datetime objects.
         */
        msToTime(dt1, dt2) {
            const res = Math.abs(Number(dt1) - Number(dt2)) / 1000;
            const hours = Math.floor(res / 3600) % 24;
            const minutes = Math.floor(res / 60) % 60;
            const seconds = Math.floor(res % 60);
            return hours + ":" + minutes + ":" + seconds + "h";
        }
        /**
         * Toggle visibility of markers by type
         */
        async toggleMarkers(markerType, show) {
            this._settings[`show${markerType.charAt(0).toUpperCase() + markerType.slice(1)}`] = show;
            const map = await this._mapElement.getMap();

            this._markers[markerType].forEach(item => {
                item.marker.setMap(show ? map : null);
                item.visible = show;
            });
        }
        /**
         * Toggle visibility of polylines by type
         */
        async togglePolylines(polylineType, show) {
            const settingKey = polylineType === 'tracks' ? 'showTracks' : 'showRoutes';
            this._settings[settingKey] = show;
            const map = await this._mapElement.getMap();

            this._polylines[polylineType].forEach(item => {
                item.polyline.setMap(show ? map : null);
                item.visible = show;
            });
        }
        /**
         * Toggle visibility of info window labels
         */
        toggleLabels(show) {
            this._settings.showLabels = show;
            // Note: This only affects new markers. Existing markers keep their click handlers.
        }
        /**
         * Change the icon for all markers
         */
        async changeIcon(iconName) {
            if (!_availableIcons.includes(iconName)) {
                console.error(`Icon ${iconName} not available`);
                return;
            }

            this._settings.customIcon = iconName;
            const map = await this._mapElement.getMap();

            // Update all existing markers
            const allMarkerTypes = ['trackPoints', 'waypoints', 'routePoints'];
            for (const markerType of allMarkerTypes) {
                this._markers[markerType].forEach(item => {
                    const iconBase = WCF_PATH + "images/markerClusterer/garmin/";
                    const newIcon = iconBase + iconName + ".webp";
                    item.marker.setIcon(newIcon);
                });
            }
        }
        /**
         * Change track color
         */
        async changeTrackColor(color) {
            this._settings.trackColor = color;

            // Update all existing polylines
            const allPolylineTypes = ['tracks', 'routes'];
            for (const polylineType of allPolylineTypes) {
                this._polylines[polylineType].forEach(item => {
                    item.polyline.setOptions({ strokeColor: color });
                });
            }
        }
        /**
         * Change track width
         */
        async changeTrackWidth(width) {
            this._settings.trackWidth = width;

            // Update all existing polylines
            const allPolylineTypes = ['tracks', 'routes'];
            for (const polylineType of allPolylineTypes) {
                this._polylines[polylineType].forEach(item => {
                    item.polyline.setOptions({ strokeWeight: width });
                });
            }
        }
        /**
         * Get available icons
         */
        getAvailableIcons() {
            return _availableIcons;
        }
        /**
         * Get current settings
         */
        getSettings() {
            return { ...this._settings };
        }
    }
    const gpxParser = new GpxParser();
    return gpxParser;
});
