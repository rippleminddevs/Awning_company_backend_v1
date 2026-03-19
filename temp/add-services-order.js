// Script to add order field to services
// Run with: node temp/add-services-order.js

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://admin:YBfFHwu4bw98l4zT@hoffnmazor.u8t7t.mongodb.net/awning_company?retryWrites=true&w=majority&appName=hoffnmazor';

const serviceOrder = [
  { name: 'Appointment', order: 1 },
  { name: 'Call Back', order: 2 },
  { name: 'Take Down for Recover', order: 3 },
  { name: 'Test Fit', order: 4 },
  { name: 'Installation', order: 5 },
  { name: 'Installation/Repair: N/C-Problem', order: 6 },
  { name: 'Installation/Repair: N/C-Warranty', order: 7 },
  { name: 'Field Measure', order: 8 },
  { name: 'Unavailable', order: 9 },
  { name: 'Patio Cover Removal', order: 10 },
  { name: 'Problem Ticket SVC Call', order: 11 },
  { name: 'Problem Ticket Installation', order: 12 },
];

async function updateServiceOrders() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Service = mongoose.model('Service', new mongoose.Schema({}, { strict: false }));

    for (const item of serviceOrder) {
      const result = await Service.updateOne(
        { name: item.name },
        { $set: { order: item.order } }
      );
      console.log(`Updated "${item.name}" -> order: ${item.order}, matched: ${result.matchedCount}`);
    }

    console.log('\n✅ All services updated successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateServiceOrders();
