# 🌍 GIS Project - Spatial Data Management

An application developed for the Geographic Information Systems (GIS) course. This project uses QGIS, pgAdmin, GeoServer, Docker, and Leaflet to efficiently manage and visualize geospatial data.

## 🌟 Features

- **Geospatial Layer Management**: Publication and visualization of layers such as trails, roads, beaches, points of interest, and entities.
- **Interactive Visualization**: Includes base maps such as roads, satellite, and heatmap.
- **Geometric Calculation**: Tools for calculating areas and distances directly on the map.
- **WMS Layers**: Integration with GeoServer for WMS layer visualization.
- **Buffer**: Calculation and visualization of buffer for any geometry.
- **Search**: Dynamic search by names of all features.
- **Backend API**: Communication with a Node.js API for CRUD operations on spatial databases.

## 🛠️ Installation

### Clone the repository:

```bash
git clone https://github.com/t2ne/geo-docker.git
```

### Configure the environment:

#### Backend:

1. Navigate to the project directory:

   ```bash
   cd geo-docker
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Install `nodemon` globally:

   ```bash
   npm install -g nodemon
   ```

4. Run the API server with `nodemon`:
   ```bash
   nodemon server.js
   ```

Part of the data (such as type name and coordinates) comes from the API, so it's important that at minimum both the **geoserver** and the **API** are running for everything to work.

#### Frontend:

One of the ways, and the one that was used to view `index.html`, was to install the **Live Server** extension in VS Code and open a server from it.

#### GeoServer:

- Configure styles and publish layers (see **Configuration** section).

#### Database:

- Restore the `sig28837.sql` file in pgAdmin (see **How to insert database** section).
- Open the frontend in the browser (if applicable).

---

## 🔧 Configuration

### How to insert the database:

#### Plain:

1. Copy contents of the sig28837-plain.sql file

2. Paste in the Query Tool of pgadmin4.

#### Non-Plain:

1. Open pgAdmin.
2. Create the database:

   - Right-click on "Databases" -> Create -> Database.
   - Name it `sig28837`.

3. Copy the `sig28837.sql` file

4. Go to the location:
   `\\wsl.localhost\docker-desktop\mnt\docker-desktop-disk\data\docker\overlay2\one_of_the_folders\merged\tmp`
   ...where "one_of_the_folders" is the one that contains the pgadmin files, and place the sql file there.

5. Restore the database:
   - Right-click on `sig28837` -> Restore.
   - Select the `sig28837.sql` file in the `tmp` folder.

### How to publish layers in GeoServer

1. Access GeoServer.
2. Create the styles:

   - Go to "Styles" -> "Add New Style".
   - Copy and paste the corresponding XML code.
   - Apply the style to the desired layer.

3. Publish the layers:
   - Configure the `stores`, `layers` and link the created styles.

### Fix CORS in GeoServer (if necessary)

1. Access the GeoServer container in Docker.

2. Edit the `web.xml` file in `/usr/local/tomcat/webapps/geoserver/WEB-INF`.

3. Enable CORS (uncomment lines 165 to 201).
4. Restart the container:
   ```bash
   su
   cd /usr/local/tomcat/bin
   ./shutdown.sh
   cd /usr/local/tomcat/bin
   ./startup.sh
   ```

---

## 🌐 Supported Browsers

Tested on:

- Chrome
- Firefox
- Edge

---

## 🙋‍♂️ Author

- @t2ne

---

## 🎓 Academic Project

This project was developed as part of a university assignment, integrating spatial databases, map servers, and interactive frontend.
