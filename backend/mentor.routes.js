const express = require('express');
const router = express.Router();
const mentorController = require('./mentor.controller');

router.post('/selectSubject', mentorController.selectSubject);
router.post('/applyEnroll', mentorController.applyEnroll);
router.post('/loadClass', mentorController.loadClass);
router.post('/updateEnroll', mentorController.updateEnroll);
router.post('/loadTutorPair', mentorController.loadTutorPair);
router.post('/loadTutorPairpairID', mentorController.loadTutorPairpairID);
router.post('/loadOutline', mentorController.loadOutline);
router.post('/submitNewSubject', mentorController.submitNewSubject);
router.post('/submitOutline', mentorController.submitOutline);
router.post('/deleteEnroll', mentorController.deleteEnroll);
router.post('/handleDeleOutline', mentorController.handleDeleOutline);
router.post('/getAllFeedbackForMentor', mentorController.getAllFeedbackForMentor);

module.exports = router