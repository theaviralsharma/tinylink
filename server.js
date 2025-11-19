require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const engine = require('ejs-mate');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

async function connectDB() {
  const url = process.env.MONGO_URL || 'mongodb://localhost:27017/tinylink';
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Mongo connected');
}
connectDB().catch(err => {
  console.error('DB connect error', err);
  process.exit(1);
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, version: '1.0' });
});

app.use('/api', apiRoutes);
app.use('/', webRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api')) {
    res.status(err.status || 500).json({ ok: false, error: err.message || 'Server error' });
  } else {
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
