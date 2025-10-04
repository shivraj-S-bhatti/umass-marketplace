# Multi-stage Dockerfile for UMass Marketplace API
# Builds Spring Boot application with Maven and creates optimized runtime image
FROM openjdk:21-jdk-slim as builder

# Set working directory
WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY src ./src

# Install Maven and build the application
RUN apt-get update && \
    apt-get install -y maven && \
    mvn clean package -DskipTests

# Runtime stage
FROM openjdk:21-jre-slim

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
