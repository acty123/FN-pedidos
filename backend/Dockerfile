# ── Stage 1: Build ──────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Caché de dependencias Gradle (se invalida solo si cambian los scripts)
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
# Normaliza CRLF→LF por si gradlew fue modificado en Windows
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew && \
    ./gradlew dependencies --no-daemon --quiet || true


# Compilar el JAR (sin tests)
COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test

# ── Stage 2: Runtime ────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

RUN addgroup -S pedidos && adduser -S pedidos -G pedidos
USER pedidos

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
