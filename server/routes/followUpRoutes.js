const express = require('express');
const router = express.Router();
const {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
} = require('../controllers/followUpController');

router.route('/')
  .get(getFollowUps)
  .post(createFollowUp);

router.route('/:id')
  .patch(updateFollowUp)
  .delete(deleteFollowUp);

module.exports = router;
