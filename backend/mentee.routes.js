const express = require('express');
const router = express.Router();
const menteeController = require('./mentee.controller');

router.get('/loadSubject', menteeController.loadSubject);
router.post('/Selectsubjectname', menteeController.Selectsubjectname);
router.post('/SearchMentee', menteeController.SearchMentee);
router.post('/SelectMentee_list', menteeController.SelectMentee_list);
router.post('/addSubjectForMentee', menteeController.addSubjectForMentee);
router.post('/MyClass', menteeController.MyClass);
router.post('/DeleteMyclass', menteeController.DeleteMyclass);
router.post('/TakeMyClass', menteeController.TakeMyClass);
router.post('/TakeMyClassMentorName', menteeController.TakeMyClassMentorName);
router.post('/MyMentor', menteeController.MyMentor);
router.post('/upsertFeedback', menteeController.upsertFeedback);
router.post('/deleteFeedback', menteeController.deleteFeedback);
router.post('/SelectMyMentor', menteeController.SelectMyMentor);

module.exports = router