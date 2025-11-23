const express = require('express');
const router = express.Router();
const browseController = require('./browse.controller');

router.post('/browse', browseController.browse);
router.post('/browseSetting', browseController.browseSetting);
router.post('/browseclass', browseController.browseclass);
router.post('/subjectapply', browseController.subjectapply);
router.post('/selectuser', browseController.selectuser);
router.post('/selectMenteeSche', browseController.selectMenteeSche);
router.post('/selectForMentor', browseController.selectForMentor);
router.post('/selectMentorSche', browseController.selectMentorSche);
router.post('/selectForUser', browseController.selectForUser);

module.exports = router