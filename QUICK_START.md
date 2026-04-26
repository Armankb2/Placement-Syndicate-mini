# 📋 Quick Reference - Push & Test

## 🚀 Push to GitHub (From Desktop)

```bash
cd C:\Users\deeks\Desktop\Java\mini-project
git add .
git commit -m "Initial commit: Microservices with Spring Boot, React & Keycloak"
git remote add origin https://github.com/YOUR_USERNAME/mini-project.git
git push -u origin main
```

---

## 💻 Test on Laptop (In VS Code)

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/mini-project.git
cd mini-project
```

### 2. Start Docker
```bash
docker-compose up -d
```

### 3. Import Keycloak
1. Go to http://localhost:9090
2. Login: admin/admin
3. Keycloak dropdown → Create Realm
4. Browse → keycloak-realm-export.json → Create

### 4. Start Services (5 terminals)
```bash
cd discovery-service && mvn spring-boot:run
cd user-service && mvn spring-boot:run
cd experience-service && mvn spring-boot:run
cd api-gatway && mvn spring-boot:run
cd frontend && npm install && npm run dev
```

### 5. Test
- Open: http://localhost:3000
- Login: student/password
- Navigate all pages
- Logout → Login: admin/admin
- Check Admin page appears

---

## ✅ What to Verify

- [ ] All Docker containers running
- [ ] Keycloak realm imported
- [ ] Eureka shows 3 services (http://localhost:8100)
- [ ] Can login as student
- [ ] Can login as admin
- [ ] Admin sees Admin link
- [ ] Can add experience
- [ ] Logout works

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Main documentation |
| **STEP3_VISUAL_GUIDE.md** | Keycloak import guide ⭐ |
| **TEST_YOURSELF.md** | Testing checklist |
| **SETUP.md** | Detailed setup |
| **keycloak-realm-export.json** | Auto-config Keycloak |
| **docker-compose.yml** | One-command infrastructure |

---

## 🎯 Success = Your Friend Does This

```bash
git clone <your-repo>
cd mini-project
docker-compose up -d
# Import JSON in Keycloak
# Start services
# Works! ✨
```

**No manual Keycloak configuration needed!** 🚀

---

## 🔧 If Issues on Laptop

1. Check Docker: `docker-compose ps`
2. Check Eureka: http://localhost:8100
3. Check logs in terminal windows
4. Read troubleshooting in README.md

---

## 📞 After Successful Test

Update README with:
```markdown
## Tested On
- ✅ Windows 11, Java 21, Node 20
- ✅ Fresh clone from GitHub
```

Then share repo with confidence! 🎉

