import express from 'express';
import { createServer } from 'http';
import { apiHandler } from '../api/index';

const app = express();
const server = createServer(app);

app.use(express.json());

app.all('/api', apiHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});