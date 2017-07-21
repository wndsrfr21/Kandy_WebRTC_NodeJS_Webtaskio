'use latest';

import express from 'express';
import { fromExpress } from 'webtask-tools';
import bodyParser from 'body-parser';
const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  const HTML = renderView({
    title: 'Kandy.io IP Call Demo',
    body: '<h1>Kandy.io IP Call Demo</h1>'
  });

  res.set('Content-Type', 'text/html');
  res.status(200).send(HTML);
});

module.exports = fromExpress(app);

function renderView(locals) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <script type="text/javascript" src="https://kandy-portal.s3.amazonaws.com/public/javascript/kandy/2.11.2/kandy.js"></script>
      <title>${locals.title}</title>
      <style> 
        video {
          width: 50% !important;
        } 
        h1 {
          color: maroon;
          margin-left: 20px;
        }
      </style>
    </head>
    
    <body>
              ${locals.body}
              
            <fieldset>
                <legend>Call Management</legend>
                <!-- User input: Callee field. -->
                Callee: <input type="text" id="callee"/>
                <!-- User input: Handle call buttons. -->
                <input type="button" value="Make Call" id="make-call" onclick="startCall();"/>
                <input type="button" value="Mute/Unmute Call" id="mute-call" onclick="toggleMute();" disabled/>
                <input type="button" value="Hold/Unhold Call" id="hold-call" onclick="toggleHold();" disabled/>
                <input type="button" value="Show/Hide Video" id="show-video" onclick="toggleVideo();"/>
                <input type="button" value="End Call" id="end-call" onclick="endCall();" disabled/>
                <input type="button" value="Accept Call" id="accept-call" onclick="acceptCall();" disabled/>
                <input type="button" value="Decline Call" id="decline-call" onclick="declineCall();" disabled/>
            </fieldset>
            
            <fieldset>
                <legend>Messages</legend>
                <!-- Message output container. -->
                <div id="messages"> </div>
            </fieldset>
            
            <!-- Media containers. -->
            Remote video: <div id="remote-container"></div>
            Local video: <div id="local-container"></div>

<script>
        /**
         * Kandy.io Call Demo
         * View this tutorial and others at https://developer.kandy.io/tutorials
         */
        
        // Variables for logging in.
        var projectAPIKey = "";
        var username = "";
        var password = "";

        // Setup Kandy to make and receive calls.
kandy.setup({
    // Designate HTML elements to be our stream containers.
    remoteVideoContainer: document.getElementById("remote-container"),
    localVideoContainer: document.getElementById("local-container"),

    // Register listeners to call events.
    listeners: {
        callInitiated: onCallInitiated,
        callIncoming: onCallIncoming,
        callEstablished: onCallEstablished,
        callEnded: onCallEnded
    }
});

// Login automatically as the application starts.
kandy.login(projectAPIKey, username, password, onLoginSuccess, onLoginFailure);

// What to do on a successful login.
function onLoginSuccess() {
    log("Login was successful.");
}

// What to do on a failed login.
function onLoginFailure() {
    log("Login failed. Make sure you input the user's credentials!");
}

// Utility function for appending messages to the message div.
function log(message) {
    document.getElementById("messages").innerHTML += "<div>" + message + "</div>";
}

// Variable to keep track of video display status.
var showVideo = true;

// Get user input and make a call to the callee.
function startCall() {
    var callee = document.getElementById("callee").value;

    // Tell Kandy to make a call to callee.
    kandy.call.makeCall(callee, showVideo);
}

// Variable to keep track of the call.
var callId;

// What to do when a call is initiated.
function onCallInitiated(call, callee) {
    log("Call initiated with " + callee + ". Ringing...");

    // Store the call id, so the caller has access to it.
    callId = call.getId();

    // Handle UI changes. A call is in progress.
    document.getElementById("make-call").disabled = true;
    document.getElementById("end-call").disabled = false;
}

// What to do for an incoming call.
function onCallIncoming(call) {
    log("Incoming call from " + call.callerNumber);

    // Store the call id, so the callee has access to it.
    callId = call.getId();

    // Handle UI changes. A call is incoming.
    document.getElementById("accept-call").disabled = false;
    document.getElementById("decline-call").disabled = false;
}

// Accept an incoming call.
function acceptCall() {
    // Tell Kandy to answer the call.
    kandy.call.answerCall(callId, showVideo);
    // Second parameter is false because we are only doing voice calls, no video.

    log("Call answered.");
    // Handle UI changes. Call no longer incoming.
    document.getElementById("accept-call").disabled = true;
    document.getElementById("decline-call").disabled = true;
}

// Reject an incoming call.
function declineCall() {
    // Tell Kandy to reject the call.
    kandy.call.rejectCall(callId);

    log("Call rejected.");
    // Handle UI changes. Call no longer incoming.
    document.getElementById("accept-call").disabled = true;
    document.getElementById("decline-call").disabled = true;
}

// What to do when call is established.
function onCallEstablished(call) {
    log("Call established.");

    // Handle UI changes. Call in progress.
    document.getElementById("make-call").disabled = true;
    document.getElementById("mute-call").disabled = false;
    document.getElementById("hold-call").disabled = false;
    document.getElementById("end-call").disabled = false;
}

// End a call.
function endCall() {
    // Tell Kandy to end the call.
    kandy.call.endCall(callId);
}

// Variable to keep track of mute status.
var isMuted = false;

// Mute or unmute the call, depending on current status.
function toggleMute() {
    if(isMuted) {
        kandy.call.unMuteCall(callId);
        log("Unmuting call.");
        isMuted = false;
    } else {
        kandy.call.muteCall(callId);
        log("Muting call.");
        isMuted = true;
    }
}

// Variable to keep track of hold status.
var isHeld = false;

// Hold or unhold the call, depending on current status.
function toggleHold() {
    if(isHeld) {
        kandy.call.unHoldCall(callId);
        log("Unholding call.");
        isHeld = false;
    } else {
        kandy.call.holdCall(callId);
        log("Holding call.");
        isHeld = true;
    }
}

// What to do when a call is ended.
function onCallEnded(call) {
    log("Call ended.");

    // Handle UI changes. No current call.
    document.getElementById("make-call").disabled = false;
    document.getElementById("mute-call").disabled = true;
    document.getElementById("hold-call").disabled = true;
    document.getElementById("end-call").disabled = true;

    // Call no longer active, reset mute and hold statuses.
    isMuted = false;
    isHeld = false;
}

// Show or hide video, depending on current status.
function toggleVideo() {
    if(showVideo) {
        kandy.call.stopCallVideo(callId);
        log("Stopping send of video.");
        showVideo = false;
    } else {
        kandy.call.startCallVideo(callId);
        log("Starting send of video.");
        showVideo = true;
    }
}
        
        
              </script>
    </body>
    </html>
  `;
}
