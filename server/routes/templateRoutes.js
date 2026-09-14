const express = require('express');
const router = express.Router();
const {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require('../controllers/templateController');

router.route('/')
  .get(getTemplates)
  .post(createTemplate);

router.route('/:id')
  .put(updateTemplate)
  .delete(deleteTemplate);

module.exports = router;
