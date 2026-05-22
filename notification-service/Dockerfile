# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
# Only copy mvnw if you use it, or just use maven image
RUN apk add --no-cache maven
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Optimized JVM Flags for 512MB RAM
# -Xmx384m: Caps heap at 384MB, leaving room for non-heap and OS
# -Xms128m: Lower initial heap to speed up startup
# -XX:+UseContainerSupport: Ensures JVM respects Docker limits
# -XX:MaxRAMPercentage=75.0: Safety net
ENV JAVA_OPTS="-Xmx384m -Xms128m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
