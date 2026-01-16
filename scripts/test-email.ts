import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
console.log('API Key present:', !!resendApiKey);
if (resendApiKey) {
    console.log('API Key start:', resendApiKey.substring(0, 5));
}

const resend = new Resend(resendApiKey);

async function main() {
    try {
        console.log('Sending test email...');
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // Default testing domain
            to: 'slmsrcncnr@gmail.com', // Verified Resend email 
            // Ideally I should send to the user, but I don't have their email handy in this context without asking.
            // However, if I use a dummy one, Resend might complain about "only sending to yourself" on free tier.
            // I'll try to send to a generic one and see the error.
            subject: 'Test Email from Giderse Gelir',
            html: '<p>It works!</p>'
        });

        console.log('Success:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
