import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (request, response) => {
  response.send('Server is runnig;');
});

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `\x1b[32m[READY]\x1b[0m Server is running on \x1b[36mhttp://localhost:${PORT}\x1b[0m`,
  );
});
