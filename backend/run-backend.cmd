@echo off
title Sakura Backend :8081
cd /d "%~dp0"
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%
set SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/sakura_style
set SPRING_DATASOURCE_USERNAME=postgres
set SPRING_DATASOURCE_PASSWORD=1234
echo Starting Sakura backend on port 8081 ...
echo Keep this window open.
mvn spring-boot:run
pause
