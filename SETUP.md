# Setup Guide for New Developers

This guide will help you set up the project from scratch.

## Prerequisites Installation

### 1. Install Java 21
- Download from: https://adoptium.net/
- Verify: `java -version` (should show 21.x)

### 2. Install Maven
- Download from: https://maven.apache.org/download.cgi
- Add to PATH
- Verify: `mvn -version`

### 3. Install Node.js 18+
- Download from: https://nodejs.org/
- Verify: `node -version` and `npm -version`

### 4. Install Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop
- Start Docker Desktop
- Verify: `docker --version` and `docker-compose --version`

## Setup Steps

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd mini-project
```

### Step 2: Start Infrastructure with Docker

```bash
# Start Keycloak, MySQL, MongoDB
docker-compose up -d

# Verify all containers are running
docker-compose ps
```

You should see:
- keycloak (port 9090)
- mysql-user-service (port 3306)
- mongodb-experience-service (port 27017)

### Step 3: Import Keycloak Configuration

#### Option A: Automatic Import (Recommended)

1. Open Keycloak Admin Console: http://localhost:9090
2. Login with username `admin` and password `admin`
3. Click on the dropdown that says **"Keycloak"** (top-left)
4. Click **"Create Realm"**
5. Click **"Browse"** button
6. Select the file `keycloak-realm-export.json` from the project root
7. Click **"Create"**

✅ You now have:
- Realm: `mini-project`
- Client: `mini-client` (configured for http://localhost:3000)
- Roles: `Student`, `Admin`
- Test users: `student/password` and `admin/admin`

#### Option B: Manual Setup

If the import doesn't work, follow the manual steps in the main README.md

### Step 4: Start Spring Boot Services

Open **4 separate terminal windows** and run:

**Terminal 1 - Discovery Service (Eureka)**
```bash
cd discovery-service
mvn spring-boot:run
```
Wait until you see "Started DiscoveryServiceApplication"

**Terminal 2 - User Service**
```bash
cd user-service
mvn spring-boot:run
```
Wait until you see "Started UserServiceApplication"

**Terminal 3 - Experience Service**
```bash
cd experience-service
mvn spring-boot:run
```
Wait until you see "Started ExperienceServiceApplication"

**Terminal 4 - API Gateway**
```bash
cd api-gatway
mvn spring-boot:run
```
Wait until you see "Started ApiGatwayApplication"

### Step 5: Verify Service Registration

1. Open Eureka Dashboard: http://localhost:8100
2. You should see 3 services registered:
   - **API-GATEWAY**
   - **USER-SERVICE**
   - **EXPERIENCE-SERVICE**

If services are not showing:
- Wait 30-60 seconds for registration
- Check that each service started without errors

### Step 6: Start React Frontend

**Terminal 5**
```bash
cd frontend
npm install
npm run dev
```

The frontend will start at http://localhost:3000 (or 3001 if 3000 is busy)

### Step 7: Test the Application

1. Open http://localhost:3000 in your browser
2. You'll be redirected to Keycloak login
3. Login with:
   - Username: `student`
   - Password: `password`
4. You should see the home page with your name
5. Try navigating:
   - **My Profile** - Should show your user info
   - **Experiences** - Browse interview experiences
   - **Add Experience** - Submit a new interview experience

To test Admin features:
- Logout
- Login with `admin` / `admin`
- You'll see an **Admin** link in the navbar

## Common Issues & Solutions

### "Invalid redirect_uri" Error

**Problem:** Keycloak rejects the login redirect

**Solution:**
1. Go to Keycloak Admin Console: http://localhost:9090
2. Click **Clients** → **mini-client**
3. Make sure **Valid Redirect URIs** includes:
   ```
   http://localhost:3000/*
   http://localhost:3001/*
   ```
4. Make sure **Valid post logout redirect URIs** includes the same
5. Click **Save**

### Port Already in Use

**Problem:** `Port 3306 is already allocated` or similar

**Solution:**
```bash
# Stop Docker services
docker-compose down

# Check what's using the port (example for 3306)
# Windows:
netstat -ano | findstr :3306

# Kill the process or change the port in docker-compose.yml
```

### Services Not Registering with Eureka

**Problem:** Eureka dashboard is empty

**Solution:**
- Wait 60 seconds (services register on a delay)
- Check each service terminal for errors
- Verify Eureka is running on port 8100
- Check `application.properties` has correct Eureka URL

### Frontend Can't Connect to Backend

**Problem:** API calls fail with network errors

**Solution:**
1. Verify API Gateway is running on port 8200
2. Check `frontend/vite.config.js` proxy points to `http://localhost:8200`
3. Open browser DevTools → Network tab to see exact error

### MySQL Connection Failed

**Problem:** User service can't connect to database

**Solution:**
```bash
# Check MySQL is running
docker logs mysql-user-service

# Check connection details in user-service/src/main/resources/application.properties
# Default: localhost:3306, user: root, password: 1234
```

### MongoDB Connection Failed

**Problem:** Experience service can't connect to database

**Solution:**
```bash
# Check MongoDB is running
docker logs mongodb-experience-service

# Check connection in experience-service/src/main/resources/application.properties
# Default: localhost:27017, database: experiencedb
```

## Environment Customization

### Change Keycloak Port

Edit `docker-compose.yml`:
```yaml
ports:
  - "9091:8080"  # Change 9090 to 9091
```

Then update in all `application.properties`:
```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:9091/realms/mini-project
```

And in `frontend/src/keycloak.js`:
```javascript
url: "http://localhost:9091/",
```

### Change Frontend Port

Edit `frontend/vite.config.js`:
```javascript
server: {
  port: 4000,  // Change from 3000 to 4000
```

Then add `http://localhost:4000/*` to Keycloak Valid Redirect URIs

### Change Service Ports

Edit each service's `application.properties`:
```properties
server.port=8085  # Change from 8081, 8082, etc.
```

## Development Workflow

1. **Make Backend Changes:**
   - Edit Java code
   - Stop service (Ctrl+C)
   - Restart: `mvn spring-boot:run`

2. **Make Frontend Changes:**
   - Edit React code
   - Vite will hot-reload automatically
   - No restart needed

3. **Database Changes:**
   - User Service uses `spring.jpa.hibernate.ddl-auto=update`
   - Schema updates automatically
   - For MongoDB, no schema needed

4. **Add New API Endpoint:**
   - Add controller method in service
   - Add route in `api-gatway/application.properties` if needed
   - Add API call in `frontend/src/services/api.js`
   - Use it in your React component

## Stopping Everything

```bash
# Stop Docker services
docker-compose down

# Stop Spring Boot services
# Press Ctrl+C in each terminal

# Stop Frontend
# Press Ctrl+C in the frontend terminal
```

## Need Help?

- Check the main [README.md](README.md) for architecture overview
- Review the troubleshooting section above
- Check service logs in the terminal windows
- Verify Keycloak configuration matches the export file

## Next Steps

Once everything is running:
1. Explore the code structure
2. Try making a simple change (e.g., add a field to UserResponse)
3. Test the APIs with Postman
4. Add a new feature (e.g., search functionality)
5. Customize the frontend design

Happy coding! 🚀

