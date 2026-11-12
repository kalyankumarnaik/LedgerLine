# ==============================================================================
# BalanceVault Backend Dockerfile (Context: Repository Root)
# ==============================================================================

# Build Stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy POM and download dependencies for caching
COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B

# Copy sources and compile production jar
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root user for fintech container security
RUN addgroup -S ledgerline && adduser -S ledgerline -G ledgerline
USER ledgerline:ledgerline

COPY --from=builder /app/target/ledgerline-backend-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep UP || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
