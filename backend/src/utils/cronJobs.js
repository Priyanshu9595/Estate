const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Rent = require('../models/Rent');
const Lease = require('../models/Lease');
const User = require('../models/User');

const initCronJobs = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running rent reminder job...');
    try {
      // Find all pending rent that is due within the next 3 days
      const today = new Date();
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);

      const pendingRents = await Rent.find({
        status: { $in: ['Pending', 'Overdue'] },
      }).populate({
        path: 'lease_id',
        populate: { path: 'user_id property_id' }
      });

      let count = 0;
      for (const rent of pendingRents) {
        const dueDate = new Date(rent.due_date);
        
        // We want to send a reminder exactly 3 days before, on the day of, and 3 days after (overdue)
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 3 || diffDays === 0 || diffDays === -3) {
          const user = rent.lease_id?.user_id;
          const property = rent.lease_id?.property_id;
          
          if (user && user.email) {
            await sendRentReminderEmail(user, property, rent, diffDays);
            count++;
          }
        }
      }
      console.log(`[CRON] Sent ${count} rent reminders.`);
    } catch (error) {
      console.error('[CRON] Error running rent reminder job:', error);
    }
  });
};

const sendRentReminderEmail = async (user, property, rent, diffDays) => {
  try {
    let subject, message;
    
    if (diffDays === 3) {
      subject = `Upcoming Rent Reminder for ${property.name}`;
      message = `This is a friendly reminder that your rent of Rs. ${rent.due_amount} for ${rent.month} is due in 3 days on ${new Date(rent.due_date).toLocaleDateString()}.`;
    } else if (diffDays === 0) {
      subject = `Urgent: Rent Due Today for ${property.name}`;
      message = `This is to remind you that your rent of Rs. ${rent.due_amount} for ${rent.month} is due today. Please make the payment to avoid late fees.`;
    } else if (diffDays === -3) {
      subject = `Overdue Notice: Rent Payment for ${property.name}`;
      message = `Your rent payment of Rs. ${rent.due_amount} for ${rent.month} was due on ${new Date(rent.due_date).toLocaleDateString()} and is now overdue. Please clear it immediately.`;
    }

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // You can change this based on provider
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"EstateFlow Management" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        text: `Hello ${user.name},\n\n${message}\n\nPlease login to your dashboard to pay.\n\nRegards,\nEstateFlow Team`,
      });
      console.log(`[CRON] Email sent to ${user.email}`);
    } else {
      // Fallback if SMTP not configured
      console.log(`[CRON - Mock Email] To: ${user.email} | Sub: ${subject} | Msg: ${message}`);
    }
  } catch (error) {
    console.error(`[CRON] Error sending email to ${user?.email}:`, error);
  }
};

module.exports = { initCronJobs };
