
# Evently telecommunications REST API
 Evently is a telecommunications REST API that enables event organizers to send SMS event reminders to participants, hence improving event 
 visibility and management. The API integrates with the Orange SMS API to send messages and uses the Foursquare API to find nearby venues.
## Endpoints
# User authentication 
  - POST auth/register
  - POST auth/login
  - POST auth/forgotPassword
  - POST auth/ResetPassword
# Event management
  - POST event/addEvent
  - GET event/RetrieveeventInfo
  - PUT event/Updateevent
 - DELETE event/deleteEvent
  - GET event/SearchPlaces
# SMS messaging
 - POST api/send-sms
 - POST api/sms-cancellation
 - POST api/sms-bulk
 - GET api/sms-usage
