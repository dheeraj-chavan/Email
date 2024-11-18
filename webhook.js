const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const emailAnalytics = require('./scheduler').emailAnalytics;


app.use(bodyParser.json()); // Parse JSON bodies

// Webhook endpoint for SendGrid events
app.post('/webhook', (req, res) => {
    const events = req.body;
  
    events.forEach(event => {
      console.log(`Event received: ${event.event} for email: ${event.email}`);
  
      // Update emailAnalytics based on the event type
      if (event.event === 'delivered') {
        emailAnalytics.emailsDelivered += 1;
      } else if (event.event === 'open') {
        emailAnalytics.emailsOpened += 1;
      } else if (event.event === 'bounce') {
        emailAnalytics.emailsBounced += 1;
      }
    });
  
    // Send a response to confirm receipt
    res.status(200).send('Webhook received');
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
