                                 # Use an official OpenJDK runtime as the base image
                                 FROM openjdk:17-jdk-slim

                                 # Set the working directory
                                 WORKDIR /app

                                 # Copy the built JAR file (adjust the path if necessary)
                                 COPY target/*.jar app.jar

                                 # Expose the application port
                                 EXPOSE 8080

                                 # Run the Spring Boot application
                                 ENTRYPOINT ["java", "-jar", "app.jar"]
