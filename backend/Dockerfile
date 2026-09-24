
# ==========================================
# Build Stage
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy Maven configuration
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build Spring Boot application
RUN mvn clean package -DskipTests -B


# ==========================================
# Runtime Stage
# ==========================================
FROM eclipse-temurin:21-jre AS runtime

WORKDIR /app

# Create non-root user
RUN useradd -m -r spring

# Copy generated JAR using a consistent name
COPY --from=build /app/target/*.jar app.jar

# Run application as non-root user
USER spring

EXPOSE 8080

# Start Spring Boot application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]