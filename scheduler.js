const schedule = require('node-schedule');
const sendEmail = require('./mailer');

// Object to track email statuses
const emailAnalytics = {
  totalEmails: 0,
  emailsSent: 0,
  emailsPending: 0,
  emailsFailed: 0,
  emailsDelivered: 0,
  emailsOpened: 0,
  emailsBounced: 0,
};

function scheduleEmails(emailList, scheduleTime) {
  console.log(`Scheduling ${emailList.length} emails for ${scheduleTime}...`);
  
  // Update analytics
  emailAnalytics.totalEmails = emailList.length;
  emailAnalytics.emailsPending = emailList.length;

  // Schedule a job at the specified time
  schedule.scheduleJob(scheduleTime, async () => {
    console.log('Starting scheduled email sending...');
    
    for (const emailData of emailList) {
      const { to, subject, text } = emailData;

      try {
        console.log(`Sending email to: ${to}`);
        await sendEmail(to, subject, text); // Call your email sending function
        console.log(`Email sent successfully to: ${to}`);

        // Update analytics
        emailAnalytics.emailsSent += 1;
        emailAnalytics.emailsPending -= 1;
      } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);

        // Update analytics
        emailAnalytics.emailsFailed += 1;
        emailAnalytics.emailsPending -= 1;
      }

      // Throttling: Delay between emails (e.g., 1 email per second)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Finished sending scheduled emails.');
    console.log('Analytics:', emailAnalytics);
  });
}

module.exports = { scheduleEmails, emailAnalytics };
