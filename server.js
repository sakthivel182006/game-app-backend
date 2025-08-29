const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const connectDB = require('./config/db');
const authRoutes = require('./routes/userRoutes');
const mcqRoutes = require('./routes/mcqRoutes');
const chesstournamentroutes = require('./routes/chesstournamentroutes');
const mcqquestionRoutes = require('./routes/mcqQuestionRoutes');
const testRoutes = require('./routes/testRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const useramountdistributionroutes = require('./routes/userAmountRoutes');

const summaryroutes = require('./routes/summaryRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const chesstournament = require('./models/chesstournament');

const courseRoutes = require('./routes/courseRoutes');
const courseTopicRoutes = require('./routes/courseTopicRoutes');
const sourceCodeRoutes = require('./routes/sourceCodeRoutes');
dotenv.config();
connectDB();

const app = express();

// ===== CORS MIDDLEWARE =====
app.use(cors({
  origin: '*', // Use specific frontend URL in production
  credentials: true
}));

// ===== Middleware =====
app.use(express.json());
app.use(bodyParser.json());

// ===== Create uploads directory if it doesn't exist =====
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Uploads directory created successfully');
}

// ===== Serve static files =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== Routes =====
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/courses', courseRoutes);
app.use('/api/coursestopics', courseTopicRoutes);
app.use('/api/sourcecodes', sourceCodeRoutes);

app.use('/api', useramountdistributionroutes);
app.use('/api', paymentRoutes);
app.use('/api', authRoutes);
app.use('/api', mcqRoutes);
app.use('/api/chess', chesstournamentroutes);

app.use('/api', summaryroutes);
app.use('/api/purchases', purchaseRoutes);

app.use('/api/testsubmissions', testRoutes);
app.use('/api/mcqquestion', mcqquestionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadDir}`);
});
