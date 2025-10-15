"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3000;
// Middleware
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
// MongoDB Connection
const url = 'mongodb+srv://prince_of_peace:Sumeshu1@cluster0.ewqyejd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'prince-of-peace-academy-payroll-system';
const client = new mongodb_1.MongoClient(url);
let db;
const connectToDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        console.log('Connected to MongoDB');
        db = client.db(dbName);
    }
    catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
});
connectToDb();
// Routes
app.get('/api/payrolls', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payrolls = yield db.collection('payrolls').find({}).toArray();
        res.json(payrolls);
    }
    catch (err) {
        res.status(500).send(err);
    }
}));
app.post('/api/payrolls', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newPayroll = req.body;
        const result = yield db.collection('payrolls').insertOne(newPayroll);
        res.status(201).json(Object.assign(Object.assign({}, newPayroll), { id: result.insertedId }));
    }
    catch (err) {
        res.status(500).send(err);
    }
}));
app.put('/api/payrolls/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updatedPayroll = req.body;
        delete updatedPayroll.id; // Remove id from the update payload
        const result = yield db.collection('payrolls').updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updatedPayroll });
        if (result.matchedCount === 0) {
            return res.status(404).send('Payroll not found');
        }
        const payroll = yield db.collection('payrolls').findOne({ _id: new mongodb_1.ObjectId(id) });
        res.json(payroll);
    }
    catch (err) {
        res.status(500).send(err);
    }
}));
app.delete('/api/payrolls/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield db.collection('payrolls').deleteOne({ _id: new mongodb_1.ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).send('Payroll not found');
        }
        res.status(204).send();
    }
    catch (err) {
        res.status(500).send(err);
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
