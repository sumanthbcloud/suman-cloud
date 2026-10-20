# Stage 1: Build Spring Boot application
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN chmod +x ./mvnw

COPY src src
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal Java 21 runtime
FROM eclipse-temurin:21-jre-alpine
RUN apk upgrade --no-cache
WORKDIR /app

COPY --from=build /app/target/*.jar app

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app"]
