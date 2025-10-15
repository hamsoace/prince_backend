
import express from 'express';
import { Db, MongoClient, ObjectId } from 'mongodb';
import bodyParser from 'body-parser';
import { Payroll } from './types';

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
const url = 'mongodb+srv://prince_of_peace:Sumeshu1@cluster0.ewqyejd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'prince-of-peace-academy-payroll-system';
const client = new MongoClient(url);

let db: Db;

const connectToDb = async () => {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(dbName);
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

connectToDb();

// Routes
app.get('/api/payrolls', async (req, res) => {
    try {
        const payrolls = await db.collection('payrolls').find({}).toArray();
        res.json(payrolls);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/api/payrolls', async (req, res) => {
    try {
        const newPayroll: Omit<Payroll, 'id'> = req.body;
        const result = await db.collection('payrolls').insertOne(newPayroll);
        res.status(201).json({ ...newPayroll, id: result.insertedId });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.put('/api/payrolls/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPayroll: Partial<Payroll> = req.body;
        delete updatedPayroll.id; // Remove id from the update payload

        const result = await db.collection('payrolls').updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedPayroll }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send('Payroll not found');
        }

        const payroll = await db.collection('payrolls').findOne({ _id: new ObjectId(id) });
        res.json(payroll);
    } catch (err) {
        res.status(500).send(err);
    }
});


app.delete('/api/payrolls/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection('payrolls').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).send('Payroll not found');
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).send(err);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
