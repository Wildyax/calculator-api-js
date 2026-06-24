# pas besoin de Maven pour se peu
FROM eclipse-temurin:21-jdk

WORKDIR /app

# copy code source
COPY src ./src

# Port de l'API Java (same que backend)
EXPOSE 3000

# Lancement en singlefile, compile et exécute salement Server.java
CMD ["java", "src/Server.java"]
