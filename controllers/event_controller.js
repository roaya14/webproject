const Event = require('../models/event');



const eventController = {
  /**
   * @swagger
   * tags:
   *   name: Event
   *   description: API endpoints for handling events 
   */

  /**
   * @swagger
   * /event/addEvent:
   *   post:
   *     summary: Add a new event 
   *     tags: [Event]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               date:
   *                 type: string
   *               time:
   *                 type: string
   *               location: 
   *                 type: string 
   *               description: 
   *                 type: string 
   *               capacity: 
   *                 type: integer
   *     responses:
   *       201:
   *         description: Event created
   *       500:
   *         description: error creating event
   */
    addEvent: async (req, res) => {

      try {
        const { name, date, time, location, description, capacity, organizerId } = req.body;
        console.log('Received JSON:', req.body);

        const event = await Event.create({
          event_name: name,
          event_date: date,
          event_time: time,
          event_location: location,
          event_description: description,
          event_capacity: capacity,
          organizer_id: organizerId,
        });
    
        res.status(201).json({ message: 'Event created', eventId: event.id });
     } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating event' });
     }
      },
    /**
 * @swagger
 * /event/retrieveEventInfo:
 *   get:
 *     summary: Retrieve information about a specific event
 *     tags: [Event]
 *     parameters:
 *       - in: query
 *         name: eventId
 *         required: true
 *         description: ID of the event to retrieve information for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response with event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 event:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The unique identifier for the event
 *                     event_name:
 *                       type: string
 *                       description: The name of the event
 *                     event_date:
 *                       type: string
 *                       format: date
 *                       description: The date of the event
 *                     event_time:
 *                       type: string
 *                       format: time
 *                       description: The time of the event
 *                     event_location:
 *                       type: string
 *                       description: The location of the event
 *                     event_description:
 *                       type: string
 *                       description: The description of the event
 *                     event_capacity:
 *                       type: integer
 *                       description: The capacity of the event
 *       400:
 *         description: Bad request, missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the issue
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating that the event was not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating a failure to retrieve event info
 */

    retrieveEventInfo: async(req,res) => {
      try {
        const eventId= req.query.eventId;
        if (!eventId) {
          return res.status(400).json({ error: 'Event ID is required' });
        }
  
        const event = await Event.findByPk(eventId);
  
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }
  
        return res.status(200).json({ event });
      } catch (error) {
        console.error('Error retrieving event info:', error);
      return res.status(500).json({ error: 'Failed to retrieve event info' });
      }
    },
    /**
 * @swagger
 * /event/updateEvent/{eventId}:
 *   put:
 *     summary: Update information for a specific event
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: ID of the event to be updated
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventName:
 *                 type: string
 *                 description: The updated name of the event
 *               eventDate:
 *                 type: string
 *                 format: date
 *                 description: The updated date of the event
 *               eventTime:
 *                 type: string
 *                 format: time
 *                 description: The updated time of the event
 *               eventLocation:
 *                 type: string
 *                 description: The updated location of the event
 *               eventDescription:
 *                 type: string
 *                 description: The updated description of the event
 *               eventCapacity:
 *                 type: integer
 *                 description: The updated capacity of the event
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the event was updated
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating that the event was not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating a failure to update the event
 */

    updateEvent : async (req, res) => {
      const eventId = req.params.eventId;
      const { eventName, eventDate, eventTime, eventLocation, eventDescription, eventCapacity } = req.body;
    
      try {
        const event = await Event.findByPk(eventId);
    
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }
    
        event.event_name = eventName;
        event.event_date = eventDate;
        event.event_time = eventTime;
        event.event_location = eventLocation;
        event.event_description = eventDescription;
        event.event_capacity = eventCapacity;
    
        await event.save();
    
        console.log('Event updated successfully');
        res.status(200).json({ message: 'Event updated successfully' });
      } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },
    /**
 * @swagger
 * /event/deleteEvent/{eventId}:
 *   delete:
 *     summary: Delete a specific event
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: ID of the event to be deleted
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the event was deleted
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating that the event was not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating a failure to delete the event
 */

    deleteEvent: async (req, res) => {
      const eventId = req.params.eventId;

      try {
          const event = await Event.findByPk(eventId);

          if (!event) {
              return res.status(404).json({ error: 'Event not found' });
          }

          await event.destroy();

          console.log('Event deleted successfully');
          res.status(200).json({ message: 'Event deleted successfully' });
      } catch (err) {
          console.error('Error deleting event:', err);
          res.status(500).json({ error: 'Internal Server Error' });
      }
  },
  
    searchPlaces: async (req, res) => {
      try {
        const { query, ll } = req.query;
        const searchParams = new URLSearchParams({
          ll,
          open_now: 'true',
          sort: 'DISTANCE',
          query,
        });
    
        const results = await fetch(
          `https://api.foursquare.com/v3/places/search?${searchParams}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: 'fsq3UAjytYwIFl9nKrblC8J3e+ixsD0bwd319vuH+nLGH5g=', 
            }
          }
        );
        const data = await results.json();
        const extractedPlaces = extractPlaces(JSON.stringify(data));
    
        res.status(200).json(extractedPlaces);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while searching for venues'});
      }
    },
  };
  const extractPlaces = (response) => {
    const data = JSON.parse(response);
    const closeRadiusPlaces = [];
    
      for (const place of data.results || []) {
        const venueName = place.name || '';
        const venueLocation = (place.location && place.location.formatted_address) || '';
    
        if (venueName && venueLocation) {
          closeRadiusPlaces.push({ name: venueName, location: venueLocation });
        }
      }
    
      return closeRadiusPlaces;
    };
    module.exports=eventController;