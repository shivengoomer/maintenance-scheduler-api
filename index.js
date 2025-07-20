const express = require('express');
const bodyParser = require('body-parser');
const { query } = require('./db');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.get('/equipment', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM equipment');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/equipment', async (req, res) => {
  const { equipment_id, name, type, location, installation_date, manufacturer, model, maintenance_interval } = req.body;
  
  try {
    await query(
      'INSERT INTO equipment VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL)',
      [equipment_id, name, type, location, installation_date, manufacturer, model, maintenance_interval]
    );
    res.status(201).json({ message: 'Equipment added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Schedule API
app.get('/schedules', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM maintenance_schedule');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/schedules', async (req, res) => {
  const { equipment_id, scheduled_date, assigned_technician, priority } = req.body;
  const schedule_id = generateId();
  
  try {
    await query(
      'INSERT INTO maintenance_schedule VALUES ($1, $2, $3, $4, $5, $6)',
      [schedule_id, equipment_id, scheduled_date, assigned_technician, priority, 'Pending']
    );
    res.status(201).json({ message: 'Schedule created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Maintenance Logs API
app.post('/logs', async (req, res) => {
  const { equipment_id, technician, description, parts_replaced, status } = req.body;
  const log_id = generateId();
  const maintenance_date = new Date();
  
  try {
    // Create log entry
    await query(
      'INSERT INTO maintenance_logs VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [log_id, equipment_id, maintenance_date, technician, description, parts_replaced, status, null]
    );
    
    // Update equipment's last maintenance date
    await query(
      'UPDATE equipment SET last_maintenance_date = $1 WHERE equipment_id = $2',
      [maintenance_date, equipment_id]
    );
    
    res.status(201).json({ message: 'Maintenance logged successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alert System
async function checkMaintenanceDue() {
  try {
    // Find equipment due for maintenance
    const { rows: equipment } = await query(`
      SELECT * FROM equipment 
      WHERE (last_maintenance_date + (maintenance_interval * INTERVAL '1 day')) <= CURRENT_DATE
      OR last_maintenance_date IS NULL
    `);
    
    for (const item of equipment) {
      // Check if already scheduled
      const { rows: existing } = await query(
        'SELECT * FROM maintenance_schedule WHERE equipment_id = $1 AND status = $2',
        [item.equipment_id, 'Pending']
      );
      
      if (existing.length === 0) {
        // Create schedule
        const schedule_id = generateId();
        const scheduled_date = new Date();
        scheduled_date.setDate(scheduled_date.getDate() + 7); // Schedule for 1 week from now
        
        await query(
          'INSERT INTO maintenance_schedule VALUES ($1, $2, $3, $4, $5, $6)',
          [schedule_id, item.equipment_id, scheduled_date, null, 'Medium', 'Pending']
        );
        
        // Create alert
        const alert_id = generateId();
        await query(
          'INSERT INTO alert_history VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [alert_id, item.equipment_id, 'Maintenance Due', new Date(), 
          `Maintenance due for ${item.name} (${item.equipment_id})`, 'Pending', 'maintenance-team@example.com']
        );
        
        // Send email notification
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: 'maintenance-team@example.com',
          subject: `Maintenance Due: ${item.name}`,
          text: `Maintenance is due for equipment ${item.name} (ID: ${item.equipment_id}). 
          It has been scheduled for ${scheduled_date.toDateString()}.`
        });
      }
    }
  } catch (err) {
    console.error('Error in maintenance check:', err);
  }
}

// Schedule daily maintenance check
cron.schedule('0 9 * * *', checkMaintenanceDue); // Runs every day at 9 AM

// Helper function
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Initial check on startup
  checkMaintenanceDue();
});