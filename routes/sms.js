var express = require("express");
var router = express.Router();
const axios = require("axios");

/**
 * @swagger
 * tags:
 *   name: SMS
 *   description: Endpoints for sending SMS
 */

/**
 * @swagger
 * /sms:
 *   post:
 *     summary: Send a single confirmation SMS
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: ID of the event associated with the SMS (optional)
 *               number:
 *                 type: string
 *                 description: Recipient's phone number
 *     responses:
 *       200:
 *         description: SMS sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: 
 *                   type: string
 *                   description: Success message indicating the sms was sent
 *       500:
 *         description: Internal Server Error or failed to send SMS
 */


const genToken = async () => {
  const result = await axios
    .post(
      "https://api.orange.com/oauth/v3/token",
      {
        grant_type: "client_credentials",
      },
      {
        headers: {
          Authorization: process.env.TOKEN_AUTH,
          Accept: "application/json",
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((res) => res.data);
  return result.access_token;
};
const getEventDetailsById = async (eventId) => {
  try {
    const response = await axios.get(`http://localhost:3000/event/retrieveEventInfo?eventId=${eventId}`);
    const eventData = response.data.event;
    if (!eventData) {
      throw new Error('Event data is undefined.');
    }

    return eventData;
    } catch (error) {
    console.error('Error retrieving event details:', error);
    throw new Error('Failed to retrieve event details');
  }
};
router.post('/sms', async function (req, res, next) {
  try {
    const eventId = req.body.eventId;
    const recipient = req.body.number;
    const token = await genToken();
    const devPhoneNumber = process.env.NUMBER_DEV;

    let eventDetails = {};
    if (eventId) {
      eventDetails = await getEventDetailsById(eventId);
    }

    if (!eventDetails || Object.keys(eventDetails).length === 0) {
      throw new Error('Event details are undefined or empty.');
    }

    

    const message = eventId
      ? `Hi ${recipient}! Don't forget about ${eventDetails.event_name} on ${eventDetails.event_date} at ${eventDetails.event_location}.`
      : req.body.message;
      console.log('Constructed message:', message);

    const result = await axios.post(
      `https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B${devPhoneNumber}/requests`,
      {
        outboundSMSMessageRequest: {
          address: `tel:+216${recipient}`,
          senderAddress: `tel:+${devPhoneNumber}`,
          outboundSMSTextMessage: {
            message: message,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    res.send('success');
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).send(error.message || 'Failed to send SMS');
  }
});
/**
 * @swagger
 * /sms-bulk:
 *   post:
 *     summary: Send SMS in bulk
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: ID of the event associated with the bulk SMS
 *               numbers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of recipient phone numbers
 *     responses:
 *       200:
 *         description: Bulk SMS sent successfully
 *       500:
 *         description: Internal Server Error or failed to send bulk SMS
 */
router.post('/sms-bulk', async function (req, res, next) {
  try {
    const eventId = req.body.eventId;
    const recipientNumbers = req.body.numbers;
    const token = await genToken();
    const devPhoneNumber = process.env.NUMBER_DEV;

    if (!eventId) {
      throw new Error('Event ID is required.');
    }

    const eventDetails = await getEventDetailsById(eventId);

    if (!eventDetails.event_name || !eventDetails.event_date || !eventDetails.event_location) {
      throw new Error('Missing required properties in eventDetails.');
    }

    const commonMessage = `Hi! Don't forget about ${eventDetails.event_name} on ${eventDetails.event_date} at ${eventDetails.event_location}.`;

    for (const recipient of recipientNumbers) {
      const message = commonMessage;

      await axios.post(
        `https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B${devPhoneNumber}/requests`,
        {
          outboundSMSMessageRequest: {
            address: `tel:+216${recipient}`,
            senderAddress: `tel:+${devPhoneNumber}`,
            outboundSMSTextMessage: {
              message: message,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
    }

    res.send('Bulk SMS sent successfully');
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    res.status(500).send(error.message || 'Failed to send bulk SMS');
  }
});
/**
 * @swagger
 * /sms-cancellation:
 *   post:
 *     summary: Send a single cancellation SMS
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: ID of the event associated with the SMS (optional)
 *               number:
 *                 type: string
 *                 description: Recipient's phone number
 *     responses:
 *       200:
 *         description: SMS sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: 
 *                   type: string
 *                   description: Success message indicating the sms was sent
 *       500:
 *         description: Internal Server Error or failed to send SMS
 */
router.post('/sms-cancellation', async function (req, res, next) {
  try {
    const eventId = req.body.eventId;
    const recipient = req.body.number;
    const token = await genToken();
    const devPhoneNumber = process.env.NUMBER_DEV;

    let eventDetails = {};
    if (eventId) {
      eventDetails = await getEventDetailsById(eventId);
    }

    if (!eventDetails || Object.keys(eventDetails).length === 0) {
      throw new Error('Event details are undefined or empty.');
    }

    const message = `We're sorry to inform you that ${eventDetails.event_name} that was supposed to happen on ${eventDetails.event_date} at ${eventDetails.event_location} got cancelled.`;
    console.log('Constructed message:', message);

    const result = await axios.post(
      `https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B${devPhoneNumber}/requests`,
      {
        outboundSMSMessageRequest: {
          address: `tel:+216${recipient}`,
          senderAddress: `tel:+${devPhoneNumber}`,
          outboundSMSTextMessage: {
            message: message,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    res.send('success');
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).send(error.message || 'Failed to send SMS');
  }
});
/**
 * @swagger
 * /sms/usage:
 *   get:
 *     summary: Retrieve SMS usage information
 *     tags: [SMS]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               - id: "6368bdba70585131d5454a5a"
 *                 type: "SELFSERVICE"
 *                 developerId: "{{developerId}}"
 *                 applicationId: "{{applicationId}}"
 *                 country: "CIV"
 *                 offerName: "SMS_OCB"
 *                 availableUnits: 120
 *                 requestedUnits: 0
 *                 status: "ACTIVE"
 *                 expirationDate: "2023-01-07T15:04:20.653Z"
 *                 creationDate: "2022-11-07T08:11:38.220Z"
 *                 lastUpdateDate: "2022-12-08T15:04:20.656Z"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal Server Error
 */

router.get('/sms/usage', async (req, res) => {
  try {
    const token = await genToken();

    const response = await axios.get('https://api.orange.com/sms/admin/v1/contracts', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching SMS usage:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;