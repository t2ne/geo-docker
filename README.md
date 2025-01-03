# Project Structure

This project is a QGIS, pgAdmin, Docker, and GeoServer project developed for a SIG (Spatial Information Systems) university course. It aims to provide a comprehensive environment for working with spatial data and performing geospatial analysis.

## Directory Structure

The project directory structure is organized as follows:

... still not completed, working on it.

-//- 

## Como meter estilos

- Entrar no geoserver

- Ir a estilos -> Novo estilo

- Colocar o nome de um dos 5 ficheiros

- Selecionar o workspace 'tp-sig', dar copy paste do código xml e Guardar

- Ir á camada correspondente ao ficheiro xml

- Clicar na mesma -> Publishing, Mudar o estilo padrão para aquele que acabamos de meter

- Mudar o estilo de 'Disponível' para 'Selecionado'

- Guardar e repetir este processo para as outras 4 tabelas.

## Como inserir base de dados

- Entrar no pgadmin4

- Right-Click Databases -> Create Database

- Nome: tp-sig -> Save

- Right-Click em tp-sig -> Restore

- Em filename, ir buscar ficheiro 'tp-sig.sql'

- Clicar em Restore.

Depois disto é necessário publicar a store, camada e layers no geoserver.

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