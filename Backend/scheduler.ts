import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { pool } from './db';

// Create a reusable transporter using SMTP transport
// To use Gmail, you'll need to set SMTP_USER and SMTP_PASS in your .env file
// The password should be a Gmail "App Password", not your standard password.
const transporter = nodemailer.createTransport({
  service: 'gmail', // Standard service name for node-mailer
  auth: {
    user: process.env.SMTP_USER || '', // e.g., 'your.email@gmail.com'
    pass: process.env.SMTP_PASS || '', // e.g., 'abcd efgh ijkl mnop'
  },
});

/**
 * Sends an email using nodemailer.
 */
async function sendProsthesisEmail(toEmail: string, info: string) {
  try {
    const mailOptions = {
      from: `"MyRights App" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'תזכורת: זכאות לפרוטזה חדשה מתקרבת!',
      text: `שלום,\n\nזוהי תזכורת אוטומטית כי בעוד כחודשיים תהיה לך זכאות לפרוטזה חדשה.\n\nהמידע שרשום אצלנו: ${info}\n\nבברכה,\nצוות MyRights`,
      html: `<div dir="rtl">
               <p>שלום,</p>
               <p>זוהי תזכורת אוטומטית כי בעוד כחודשיים תהיה לך זכאות לפרוטזה חדשה.</p>
               <p><strong>המידע שרשום אצלנו:</strong> ${info}</p>
               <br/>
               <p>בברכה,<br/>צוות MyRights</p>
             </div>`
    };

    const infoRes = await transporter.sendMail(mailOptions);
    console.log(`[Scheduler] Email sent successfully to ${toEmail}: ${infoRes.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Scheduler] Error sending email to ${toEmail}:`, error);
    return false;
  }
}

/**
 * Starts the cron job.
 * Runs every day at 08:00 AM: '0 8 * * *'
 * For testing purposes, you could change this to '* * * * *' to run every minute.
 */
export function startScheduler() {
  console.log('[Scheduler] Starting daily cron job for prosthesis reminders...');

  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Running daily check for scheduled emails...');
    
    try {
      // Find all schedules where the next_email_date is today or in the past
      const result = await pool.query(
        `SELECT ps.id, ps.user_id, ps.info, ps.next_email_date, r.email 
         FROM prosthesis_schedules ps
         JOIN registrations r ON ps.user_id = r.id
         WHERE ps.next_email_date <= CURRENT_DATE`
      );

      if (result.rowCount === 0) {
        console.log('[Scheduler] No emails to send today.');
        return;
      }

      console.log(`[Scheduler] Found ${result.rowCount} emails to send.`);

      for (const row of result.rows) {
        if (!row.email) {
          console.log(`[Scheduler] User ${row.user_id} has no email address. Skipping.`);
          continue;
        }

        // Send the email
        const sent = await sendProsthesisEmail(row.email, row.info);

        if (sent) {
          // If sent successfully, reschedule for exactly 3 years from today.
          // This ensures a continuous 3-year cycle.
          await pool.query(
            `UPDATE prosthesis_schedules 
             SET next_email_date = CURRENT_DATE + INTERVAL '3 years'
             WHERE id = $1`,
            [row.id]
          );
          console.log(`[Scheduler] Rescheduled schedule ID ${row.id} for 3 years from today.`);
        }
      }

    } catch (error) {
      console.error('[Scheduler] Error during daily check:', error);
    }
  });
}
