const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const SERVICE_NAME = process.env.SERVICE_NAME || 'dummy-service';

app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${SERVICE_NAME}] ${req.method} ${req.url}`);
  next();
});

// Common health check endpoints
app.get(['/', '/health', '/actuator/health'], (req, res) => {
  res.json({ status: 'UP', service: SERVICE_NAME });
});

// Info endpoint
app.get('/actuator/info', (req, res) => {
  res.json({
    app: {
      name: SERVICE_NAME,
      description: `Dummy ${SERVICE_NAME} for status verification`
    }
  });
});

// Wildcard endpoint to return 200 OK for dummy purposes
app.all('*', (req, res) => {
  res.status(200).json({
    message: `Hello from dummy ${SERVICE_NAME}!`,
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`Dummy ${SERVICE_NAME} running on port ${PORT}`);
});
