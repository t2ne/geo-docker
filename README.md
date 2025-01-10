
# 🌍 SIG Project - Gestão de Dados Espaciais

Uma aplicação desenvolvida para a disciplina de Sistemas de Informação Geográfica (SIG). Este projeto utiliza QGIS, pgAdmin, GeoServer, Docker e Leaflet para gerir e visualizar dados geoespaciais de forma eficiente.

## 🌟 Funcionalidades
- **Gestão de Camadas Geoespaciais**: Publicação e visualização de camadas como trilhos, estradas, praias, pontos de interesse e entidades.
  
- **Visualização Interativa**: Inclui mapas base como estradas, satélite e heatmap.
  
- **Cálculo Geométrico**: Ferramentas para cálculo de áreas e distâncias diretamente no mapa.
  
- **Camadas WMS**: Integração com GeoServer para visualização de camadas WMS.
  
- **Buffer**: Cálculo e visualização do buffer de qualquer geometria.
  
- **Pesquisa**: Pesquisa dinâmica pelos nomes de todas as 'features'.
  
- **API Backend**: Comunicação com uma API Node.js para operações CRUD em bases de dados espaciais.

## 🛠️ Instalação

### Clone o repositório:

```bash
git clone https://github.com/t2ne/geo-docker.git
```

### Configure o ambiente:

#### Backend:

1. Navegue até o diretório do projeto:
   ```bash
   cd geo-docker
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Instale o `nodemon` globalmente:
   ```bash
   npm install -g nodemon
   ```

4. Execute o servidor da API com `nodemon`:
   ```bash
   nodemon server.js
   ```

Parte dos dados (como o nome do tipo e as coordenadas) são vindas da API, portanto é importante que, no mínimo, ambos o **geoserver** e a **API** estejam a correr para tudo funcionar.

#### Frontend:

Uma das maneiras, e a que foi utilizada para ver `index.html`, foi instalar a extensão **Live Server** no VS Code e abrir um servidor do mesmo.


#### GeoServer:

- Configure os estilos e publique as camadas (ver seção **Configuração**).

#### Base de Dados:

- Restaure o arquivo `sig28837.sql` no pgAdmin (ver seção **Como inserir base de dados**).
- Abra o frontend no navegador (se aplicável).

---

## 🔧 Configuração

### Como inserir a base de dados:

#### Plain:

1. Copiar conteúdos do ficheiro sig28837-plain.sql

2. Dar paste na Query Tool do pgadmin4.

#### Não-Plain:

1. Abra o pgAdmin.
   
2. Crie a base de dados:
   - Right-click em "Databases" -> Create -> Database.
   - Nomeie como `sig28837`.

3. Copie o ficheiro `sig28837.sql`

4. Vá até á localização:
    `\\wsl.localhost\docker-desktop\mnt\docker-desktop-disk\data\docker\overlay2\uma_das_pastas\merged\tmp`
   ...onde "uma_das_pastas" é aquela em que contém os ficheiros do pgadmin, e coloque aí o ficheiro sql.
  
5. Restaure a base de dados:
   - Right-click em `sig28837` -> Restore.
   - Selecione o arquivo `sig28837.sql` na pasta `tmp`.

### Como publicar camadas no GeoServer

1. Acesse o GeoServer.
   
2. Crie os estilos:
   - Vá a "Estilos" -> "Novo Estilo".
   - Copie e cole o código XML correspondente.
   - Aplique o estilo à camada desejada.
  
3. Publique as camadas:
   - Configure as `stores`, `layers` e vincule os estilos criados.

### Corrigir CORS no GeoServer (se necessário)

1. Acesse o container do GeoServer no Docker.

2. Edite o arquivo `web.xml` em `/usr/local/tomcat/webapps/geoserver/WEB-INF`.

3. Habilite o CORS (descomente as linhas 165 a 201).
   
4. Reinicie o container:
   ```bash
   su
   cd /usr/local/tomcat/bin
   ./shutdown.sh
   cd /usr/local/tomcat/bin
   ./startup.sh
   ```

---

## 🌐 Navegadores Suportados

Testado em:
- Chrome
- Firefox
- Edge

---

## 🙋‍♂️ Autor

- @t2ne

---

## 🎓 Projeto Académico

Este projeto foi desenvolvido como parte de um trabalho universitário, integrando bases de dados espaciais, servidores de mapas e frontend interativo.
