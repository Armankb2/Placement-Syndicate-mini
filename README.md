# Mini Project - Microservices with Spring Boot, React & Keycloak

A full-stack microservices application with Spring Cloud Gateway, Eureka Service Discovery, Keycloak authentication, and React frontend.

## Architecture

- **Discovery Service** (Port 8100) - Eureka Server
- **API Gateway** (Port 8200) - Spring Cloud Gateway with Keycloak OAuth2
- **User Service** (Port 8081) - MySQL
- **Experience Service** (Port 8082) - MongoDB
- **Frontend** (Port 3000/3001) - React with Keycloak JS
- **Keycloak** (Port 9090) - Identity & Access Management

## Prerequisites

- Java 21
- Node.js 18+ and npm
- Docker & Docker Compose
- Maven

## Quick Start (Using Docker Compose)

### 1. Start Infrastructure Services

```bash
# Start Keycloak, MySQL, and MongoDB
docker-compose up -d

# Wait for services to be ready (30-60 seconds)
docker-compose ps
```

### 2. Configure Keycloak

#### Option A: Import Realm (Easiest)

1. Open Keycloak Admin Console: http://localhost:9090
2. Login with `admin` / `admin`
3. Click **Create Realm** button
4. Click **Browse** and select `keycloak-realm-export.json`
5. Click **Create**

✅ Done! The realm `mini-project` with client `mini-client` and test users is ready.

#### Option B: Manual Setup (If import fails)

<details>
<summary>Click to expand manual setup steps</summary>

1. **Create Realm**
   - Go to http://localhost:9090
   - Login: `admin` / `admin`
   - Click **Create Realm** → Name: `mini-project` → **Create**

2. **Create Client**
   - Go to **Clients** → **Create client**
   - Client ID: `mini-client`
   - Client type: **OpenID Connect**
   - Click **Next**
   - **Client authentication**: OFF (Public client)
   - **Standard flow**: Enabled
   - **Direct access grants**: Enabled
   - Click **Save**

3. **Configure Client URLs**
   - **Root URL**: `http://localhost:3000`
   - **Valid redirect URIs**: 
     ```
     http://localhost:3000/*
     http://localhost:3001/*
     http://localhost:8200/*
     ```
   - **Valid post logout redirect URIs**:
     ```
     http://localhost:3000/*
     http://localhost:3001/*
     ```
   - **Web origins**: `*`
   - Click **Save**

4. **Create Roles**
   - Go to **Realm roles** → **Create role**
   - Create: `Student` and `Admin`

5. **Create Test Users**
   - Go to **Users** → **Add user**
   - Username: `student`, Email: `student@example.com` → **Create**
   - Go to **Credentials** tab → Set password: `password` (temporary: OFF)
   - Go to **Role mapping** → Assign **Student** role
   - Repeat for `admin` user with password `admin` and both `Student` + `Admin` roles

</details>

### 3. Start Spring Boot Microservices

```bash
# Terminal 1 - Discovery Service
cd discovery-service
mvn spring-boot:run

# Terminal 2 - User Service (wait for discovery to start)
cd user-service
mvn spring-boot:run

# Terminal 3 - Experience Service
cd experience-service
mvn spring-boot:run

# Terminal 4 - API Gateway
cd api-gatway
mvn spring-boot:run
```

**Verify services are registered:**
- Open http://localhost:8100 (Eureka Dashboard)
- You should see: API-GATEWAY, USER-SERVICE, EXPERIENCE-SERVICE

### 4. Start React Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will open at http://localhost:3000 (or 3001 if 3000 is busy)

## Test Users

| Username | Password | Roles |
|----------|----------|-------|
| student  | password | Student |
| admin    | admin    | Admin, Student |

## API Endpoints

All requests go through API Gateway at `http://localhost:8200`

### User Service
- `GET /api/users/me` - Get current user profile (requires auth)
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users/register` - Register new user

### Experience Service
- `GET /api/experience/{userid}` - Get experience by user ID
- `POST /api/experience/register` - Add interview experience (requires auth)
- `GET /api/experience/companies` - List all companies
- `GET /api/experience/company/{name}` - Get experiences by company

## Frontend Pages

- **/** - Home page
- **/profile** - User profile (calls `/api/users/me`)
- **/experiences** - Browse interview experiences by company
- **/experiences/new** - Add new interview experience
- **/admin** - Admin panel (Admin role required)

## Development Tips

### Change Ports

If ports are busy, update:
- **Keycloak**: Change `9090:8080` in `docker-compose.yml`
- **Frontend**: Change `server.port` in `frontend/vite.config.js`
- **Services**: Change `server.port` in each `application.properties`

Then update Keycloak redirect URIs and frontend API proxy accordingly.

### Testing with Postman

1. Get access token from Keycloak:
   ```
   POST http://localhost:9090/realms/mini-project/protocol/openid-connect/token
   Body (x-www-form-urlencoded):
     grant_type: password
     client_id: mini-client
     username: student
     password: password
   ```

2. Use the `access_token` in Authorization header:
   ```
   Authorization: Bearer <access_token>
   ```

### Troubleshooting

**"Invalid redirect_uri" error:**
- Check Keycloak client `mini-client` has correct redirect URIs
- Ensure port matches your actual frontend port (3000 or 3001)

**Services not registering with Eureka:**
- Wait 30-60 seconds for registration
- Check `eureka.client.service-url.defaultZone=http://localhost:8100/eureka` in application.properties

**Frontend can't reach API:**
- Verify API Gateway is running on port 8200
- Check browser console for CORS errors
- Ensure proxy in `vite.config.js` points to correct Gateway URL

**Database connection errors:**
- Ensure Docker containers are running: `docker-compose ps`
- Check MySQL: `docker logs mysql-user-service`
- Check MongoDB: `docker logs mongodb-experience-service`

## Project Structure

```
mini-project/
├── api-gatway/           # Spring Cloud Gateway + OAuth2 Resource Server
├── discovery-service/    # Eureka Server
├── user-service/         # User management (MySQL + JPA)
├── experience-service/   # Interview experiences (MongoDB)
├── frontend/             # React + Keycloak JS + React Router
├── docker-compose.yml    # Keycloak + MySQL + MongoDB
└── keycloak-realm-export.json  # Keycloak configuration
```

## Stopping Services

```bash
# Stop Docker services
docker-compose down

# Stop Spring Boot services: Ctrl+C in each terminal

# Stop frontend: Ctrl+C
```

## Technologies Used

### Backend
- Spring Boot 3.3.7
- Spring Cloud 2023.0.4 (Gateway, Netflix Eureka)
- Spring Security OAuth2 Resource Server
- Spring Data JPA (MySQL)
- Spring Data MongoDB
- Keycloak (OAuth2/OIDC)

### Frontend
- React 19
- Vite
- React Router DOM
- Keycloak JS Adapter
- Axios

### Infrastructure
- Docker & Docker Compose
- MySQL 8.0
- MongoDB 7.0
- Keycloak 23.0

## License

MIT

