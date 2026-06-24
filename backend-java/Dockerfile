# Dockerfile multi-stage de l'API Java.
#   - build   : compile les sources et produit app.jar
#   - test    : compile + exécute les tests JUnit  (npm run test:java)
#   - app : image finale légère (JRE) qui ne contient que app.jar

# Stage 1 : build (compile + package)
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY src ./src
RUN javac -d out $(find src -name '*.java')
RUN jar --create --file app.jar --main-class Server -C out .

# Stage 2 : test
# Hérite de "build"
# Lancé via "npm run test:java"
FROM build AS test
ADD https://repo1.maven.org/maven2/org/junit/platform/junit-platform-console-standalone/1.11.3/junit-platform-console-standalone-1.11.3.jar junit.jar
COPY test ./test
RUN javac -cp "junit.jar:out" -d out-test $(find test -name '*.java')
# Les tests s'exécutent au "docker run" -> sortie propre
CMD ["java", "-jar", "junit.jar", "execute", \
     "--class-path", "out:out-test", "--scan-class-path", \
     "--details=tree", "--reports-dir=reports"]

# Stage 3 : app
# Image finale : JRE seul pour executer + app.jar. Ni JDK, ni JUnit, ni tests, ni deps
FROM eclipse-temurin:21-jre AS app
WORKDIR /app
COPY --from=build /app/app.jar app.jar
EXPOSE 3000
CMD ["java", "-jar", "app.jar"]
