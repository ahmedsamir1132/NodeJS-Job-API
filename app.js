require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
const swaggerUI = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocument = yaml.load('./swagger.yaml');

//Route
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

//security
const cors = require('cors');
const xss = require('xss-clean');
const helmet = require('helmet');
const rateLimiter = require('express-rate-limit');

//auth
const auth = require('./middleware/authentication');

//DB
const connectDB = require('./db/connect');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// extra packages
app.set('trust proxy', 1);
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100
}));
app.use(express.json());
app.use(cors());
app.use(xss());
app.use(helmet());

// routes
app.get('/', (req, res) => {
  res.send('<h1>Jobs API</h1> <a href="/api-docs">Swagger Docs</a>');
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use('/', authRouter);
app.use('/', auth ,jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGOO_URL);
    app.listen(port, () => console.log(`Server is listening on port ${port}...`));
  } 
  catch (error) {
    console.log(error);
  }
};

start();