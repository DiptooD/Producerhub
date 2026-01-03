/**
 * ProducerHub - Production Server
 * Version: 1.15
 * Description: Serves static assets and provides API hooks for future expansion.
 */

const express = require('express');
const path = require('path');
const app = express();

// Set the port (default 3000 or provided by hosting environment)
const PORT = process.env.PORT || 3000;

/**
 * MIDDLEWARE
 */
// Parse JSON bodies (essential for the newsletter form)
app.use(express.json());

// Serve all static files (index.html, style.css, script.js, and images)
// Assuming they are located in the same root folder as this file.
app.use(express.static(__dirname));

/**
 * ROUTES
 */

// Primary Route: Serves the ProducerHub SPA
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * API: Newsletter Subscription
 * Receives the email from the frontend handleSubscribe() function.
 */
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ 
            success: false, 
            message: "A valid email address is required." 
        });
    }

    // LOGIC: For now, we log the subscription to the console.
    // In a production environment, you would connect to Mailchimp, 
    // MongoDB, or a CSV file writer here.
    console.log(`[Subscription] New member joined: ${email}`);

    res.status(200).json({ 
        success: true, 
        message: "Welcome to the Inner Circle!" 
    });
});

/**
 * FALLBACK: Single Page Application (SPA) Logic
 * If a user refreshes on a sub-route, redirect them back to the main app.
 */
app.get('*', (req, res) => {
    res.redirect('/');
});

/**
 * SERVER START
 */
app.listen(PORT, () => {
    console.clear();
    console.log('-------------------------------------------');
    console.log('   🎧  PRODUCER HUB | LIVE ON SERVER  🎧   ');
    console.log('-------------------------------------------');
    console.log(`> Local:   http://localhost:${PORT}`);
    console.log(`> Admin:   Access via Footer (Pass: 7744)`);
    console.log(`> Status:  Ready for VSTs, Packs, & Presets`);
    console.log('-------------------------------------------');
    console.log('Press Ctrl+C to shut down the server.');
});