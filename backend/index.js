const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// استيراد الراوترات
const clientsRouter = require('./routes/clients');
const ordersRouter = require('./routes/orders');
const measurementsRouter = require('./routes/measurements');
const installationsRouter = require('./routes/installations');
const inventoryRouter = require('./routes/inventory');
const usersRouter = require('./routes/users');

app.use('/api/clients', clientsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/measurements', measurementsRouter);
app.use('/api/installations', installationsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/users', usersRouter);

app.get('/', (req, res) => {
  res.send('Client Management API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
