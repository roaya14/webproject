const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event_controller');
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token,"secretkey");
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
router.post('/addEvent',verifyToken,eventController.addEvent);
router.get('/retrieveeventinfo', eventController.retrieveEventInfo);
router.put('/updateevent/:eventId', eventController.updateEvent);
router.delete('/deleteEvent/:eventId', eventController.deleteEvent); 
router.get('/search-places', eventController.searchPlaces);

module.exports=router;