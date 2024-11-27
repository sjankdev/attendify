# Stage 1: Build the application
FROM openjdk:17-jdk-slim as builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper and pom.xml for building the project
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Install dependencies (without running tests)
RUN ./mvnw dependency:go-offline

# Copy the source code and build the application
COPY src ./src

# Build the application and skip tests (creates JAR in target directory)
RUN ./mvnw clean package -DskipTests

# Stage 2: Create the final image with the JAR file
FROM openjdk:17-slim

# Set the working directory inside the container
WORKDIR /app

# Use a wildcard to copy the JAR file (in case the version or name changes)
COPY --from=builder /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
