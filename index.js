const express = require("express");
const app = express();
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
require("dotenv").config({ path: __dirname + "/.env" })

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
const calendar = google.calendar({ version: "v3", auth: oauth2Client });

app.post("/api/v1/test-meeting", function (req, res, next) {

    const event = {
        summary: req.body.summary,
        location: req.body.location,
        description: req.body.description,
        colorId: "1",
        conferenceData: {
            createRequest: {
                requestId: "zzz",
                conferenceSolutionKey: {
                    type: "hangoutsMeet"
                }
            }
        },
        start: {
            dateTime: req.body.start,
            timeZone: 'Africa/Lagos',
        },
        end: {
            dateTime: req.body.end,
            timeZone: 'Africa/Lagos',
        },
    }

    calendar.freebusy.query({
        resource: {
            timeMin: req.body.start,
            timeMax: req.body.end,
            timeZone: 'Africa/Lagos',
            items: [{id: 'primary'}]
        }
    }, async (err, result) => {
        if(err) return console.error('An error occured: ', err)
        else{
            const eventsArr = result.data.calendars.primary.busy
            if(eventsArr.length === 0) {
                let link = await calendar.events.insert({
                    calendarId: 'primary', 
                    conferenceDataVersion: '1', 
                    resource: event 
                })
                return res.status(200).json({ message: 'Success', link: link.data.hangoutLink })
            }
            return res.status(200).json({ message: 'Date and Time is occupied' })
        }
    })
})

app.listen(5443, () => {
    console.log("Server is runnig on port 5443");
})