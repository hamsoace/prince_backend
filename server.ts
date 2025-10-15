import express from 'express';
import { MongoClient, ObjectId, Db } from 'mongodb';
import bodyParser from 'body-parser';
import { Payroll } from './types';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// CORS Configuration - Must be BEFORE other middleware
const corsOptions = {
    origin: [
        'https://3001-firebase-prince-of-peace-1760521804462.cluster-ikslh4rdsnbqsvu5nw3v4dqjj2.cloudworkstations.dev',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'https://prince-red.vercel.app' // Add your production domain here
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// MongoDB Connection
const url = process.env.MONGODB_URI || 'mongodb+srv://prince_of_peace:Sumeshu1@cluster0.ewqyejd.mongodb.net/prince-of-peace-academy-payroll-system?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);

let db: Db;

const connectToDb = async () => {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db('prince-of-peace-academy-payroll-system');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        // Retry connection instead of exiting
        setTimeout(connectToDb, 5000);
    }
};

connectToDb();

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        database: db ? 'connected' : 'disconnected' 
    });
});

// Routes
app.get('/api/payrolls', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const payrolls = await db.collection('payrolls').find({}).toArray();
        res.json(payrolls);
    } catch (err) {
        console.error('Error fetching payrolls:', err);
        res.status(500).json({ error: 'Failed to fetch payrolls' });
    }
});

app.post('/api/payrolls', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const newPayroll: Omit<Payroll, 'id'> = req.body;
        const result = await db.collection('payrolls').insertOne(newPayroll);
        res.status(201).json({ ...newPayroll, id: result.insertedId });
    } catch (err) {
        console.error('Error creating payroll:', err);
        res.status(500).json({ error: 'Failed to create payroll' });
    }
});

app.put('/api/payrolls/:id', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const { id } = req.params;
        const updatedPayroll: Partial<Payroll> = req.body;
        delete updatedPayroll.id;

        const result = await db.collection('payrolls').updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedPayroll }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Payroll not found' });
        }

        const payroll = await db.collection('payrolls').findOne({ _id: new ObjectId(id) });
        res.json(payroll);
    } catch (err) {
        console.error('Error updating payroll:', err);
        res.status(500).json({ error: 'Failed to update payroll' });
    }
});

app.delete('/api/payrolls/:id', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const { id } = req.params;
        const result = await db.collection('payrolls').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Payroll not found' });
        }

        res.status(204).send();
    } catch (err) {
        console.error('Error deleting payroll:', err);
        res.status(500).json({ error: 'Failed to delete payroll' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});