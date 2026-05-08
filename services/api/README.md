<div align="center">

![Isle Logo](../../apps/desktop/public/Isle-logo-blue.svg)

</div>

# Isle — Backend Engineering

The backend is a high-performance REST API built with Spring Boot 3.4 and Java 21. It manages users, securely authenticates sessions, parses recurrence logic (RRule), and persists habit logs to a PostgreSQL 16 database.

## Tech Stack
- **Framework**: Spring Boot 3.4
- **Language**: Java 21 (Records, Virtual Threads)
- **Database**: PostgreSQL 16
- **Migrations**: Flyway
- **Authentication**: Spring Security (OAuth2 Resource Server) + custom PKCE logic
- **Testing**: JUnit 5 + Testcontainers

## Folder Structure

```
services/api/
├── src/main/java/com/habittracker/
│   ├── auth/         # OAuth 2.0 PKCE flow, JWT generation
│   ├── config/       # SecurityConfig, CORS, Global exception handlers
│   ├── habit/        # Controllers, Services, Repositories, DTOs
│   ├── shared/       # Pagination envelopes, Utility exceptions
│   └── rrule/        # RecurrenceEngine for parsing iCal RRULEs
└── src/main/resources/
    ├── application.yml   # Core Spring Boot configuration
    └── db/migration/     # Flyway SQL migration scripts
```

## Running Locally

### Prerequisites
A PostgreSQL database must be running locally on port `5432` with the database `habittracker`.

1. **Set Environment Variables:**
You can set these in your IDE or terminal.
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/habittracker
export SPRING_DATASOURCE_USERNAME=ht_user
export SPRING_DATASOURCE_PASSWORD=devpassword
export JWT_PRIVATE_KEY_PATH=/absolute/path/to/infra/secrets/jwt_private.pem
export JWT_PUBLIC_KEY_PATH=/absolute/path/to/infra/secrets/jwt_public.pem
export GOOGLE_CLIENT_ID=your_google_client_id
export GOOGLE_CLIENT_SECRET=your_google_client_secret
```

2. **Start the server:**
```bash
mvn spring-boot:run
```

3. **Run Tests:**
Tests use Testcontainers to spin up a fresh, ephemeral PostgreSQL database. Ensure Docker is running.
```bash
mvn verify
```

## Core Backend Concepts

### Recurrence Engine (`RRule`)
To support complex schedules ("Every Monday, Wednesday, and Friday" or "Every 1st of the Month"), we avoid standard cron jobs. Instead, the backend stores schedules as standard iCal `RRULE` strings. When calculating streaks or checking if a habit is due, the `RecurrenceEngine` mathematically intersects the habit's creation date, the RRule, and the current evaluation window.

### Timezone Consistency
A core requirement of the application is that a user's streak should not break if they travel or if their system time does not match the server's UTC time. 

The API mandates an `X-Timezone` header for all requests that calculate time boundaries. 
- Example: If a user in `Asia/Tokyo` logs a habit at 1:00 AM local time, but it is still 4:00 PM UTC yesterday on the server, the backend forces the `LocalDate` calculation into the Tokyo timezone before persisting the log. This guarantees absolute data integrity for streaks.

### Authentication & JWTs
The API does not handle standard username/password login. It acts entirely as an OAuth PKCE verification server. 
- When a user logs in, the API accepts the Google authorization code, verifies the PKCE challenge, talks server-to-server with Google to fetch the email, and then mints its own internal `RS256` signed JWT.
- Access tokens live for 15 minutes. Refresh tokens are opaque strings persisted securely in the database and valid for 30 days.
