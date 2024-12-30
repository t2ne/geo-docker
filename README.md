# Project Structure

This project is a QGIS, pgAdmin, Docker, and GeoServer project developed for a SIG (Spatial Information Systems) university course. It aims to provide a comprehensive environment for working with spatial data and performing geospatial analysis.

## Directory Structure

The project directory structure is organized as follows:

... still not completed, working on it.

-//- 

## Fix: Problema com o CORS

- Docker -> Containers -> geoserver

- Aba 'Files'

- Ir a '/usr/local/tomcat/webapps/geoserver/WEB-INF'

- Entrar no ficheiro 'web.xml'

- Dar enable do CORS - Uncomment da linha 165 á 201

- Save do ficheiro

- Ir á aba 'Exec' do container

- Escrever o comando: su

- Depois: cd /usr/local/tomcat/bin/shutdown.sh

- Reiniciar o container

- De novo: su

- cd /usr/local/tomcat/bin/startup.sh