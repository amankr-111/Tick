const express = require('express');
const fs = require('fs');
const app = express();
const port = 3002;
const cors = require('cors');
app.use(cors());
app.use(express.json());
const path = require('path');

let data = [];

if (fs.existsSync('data.json')) {
  const jsonData = fs.readFileSync('data.json', 'utf8');
  data = JSON.parse(jsonData);
}

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'data.json');

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.post('/updateWorkingDays', (req, res) => {
  const newData = req.body;

  if (!Array.isArray(newData)) {
    console.error('Invalid newData. Expected an array.');
    return res.status(400).send('Invalid newData. Expected an array.');
  }

  newData.forEach((newItem) => {
    // Check if there is already data with the same date and time
    const isDuplicate = data.some((item) => {
      return item.Date === newItem.Date && item.Time === newItem.Time;
    });

    if (!isDuplicate) {
      // If it's not a duplicate, add it to the data array
      data.push(newItem);
    }
  });

  fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Error writing JSON file:', err);
      return res.status(500).send('Error writing JSON file');
    }

    console.log('Data updated and saved to data.json successfully.');
    res.sendStatus(200);
  });
});

app.delete('/clearDataOnReload', (req, res) => {
  try {
    data = []; 
    fs.writeFileSync('data.json', '[]', 'utf-8'); 
    res.json({ success: true, message: 'Data cleared on reload' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error clearing data on reload', error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
