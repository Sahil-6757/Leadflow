const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../utils/seedData');

router.post('/reset', async (req, res) => {
  try {
    const result = await seedDatabase(true);
    res.status(200).json({
      success: true,
      message: 'Database reset and re-seeded with demo data successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset and seed database',
      error: error.message,
    });
  }
});

module.exports = router;
