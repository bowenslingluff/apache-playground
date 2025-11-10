const express = require('express');
const router = express.Router();
const Ad = require('../models/ad.model');
const AdEvent = require('../models/adevent.model');

// Get a random ad
router.get('/random', async (req, res) => {
  try {
    const randomAd = await Ad.aggregate([{ $sample: { size: 1 } }]);

    if (randomAd.length === 0) {
      return res.status(404).json({ message: 'No ads found' });
    }

    res.status(200).json(randomAd[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Record an ad event
router.post('/event', async (req, res) => {
  try {
    const { adId, articleId, eventType, userId } = req.body;

    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];

    const newEvent = new AdEvent({
      adId,
      articleId, // The article the ad was on
      eventType, // 'impression' or 'interaction'
      userIp,
      userAgent,
      userId: userId || null 
    });

    await newEvent.save();

    res.status(201).json({ message: 'Ad event recorded' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;