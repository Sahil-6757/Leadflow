const express = require('express');
const router = express.Router();
const { getActivities, createActivity } = require('../controllers/activityController');

router.route('/')
  .get(getActivities)
  .post(createActivity);

module.exports = router;
