import express from "express";
import morgan from "morgan";
import { WebhookClient, Text, Suggestion, Card, Image, Payload } from 'dialogflow-fulfillment';
// import dialogflowFulfilment from "dialogflow-fulfillment";
import bodyParser from "body-parser";
import twilio from "twilio";
import cors from "cors";
import dialogflow from '@google-cloud/dialogflow'
// https://googleapis.dev/nodejs/dialogflow/latest/index.html

// import gcHelper from './google-credentials.json' ;

// gcHelper(true);


// const sessionClient = new dialogflow.SessionsClient();
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(morgan("dev"));
app.use(cors())
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});
// ab iska route ka through hum dialog flow sa  request mangwara ha

// https://cloud.google.com/dialogflow/es/docs/fulfillment-webhook
// https://cloud.google.com/dialogflow/es/docs/fulfillment-webhook#webhook-nodejs
app.post("/webhook", (request, response) => {
  const _agent = new WebhookClient({ request, response });
  // const _agent = new WebhookClient({req,res});

  function welcome(agent) {
    agent.add(`Welcome to my Pizza shop!`);
  }

  function order(agent) {

    const pizzaFlavors = agent.parameters.pizzaFlavors;
    const qty = agent.parameters.qty;
    const PizzaSize = agent.parameters.PizzaSize;

    console.log("qty=>", qty);
    console.log("PizzaSize=>", PizzaSize);
    console.log("pizzaFlavors=>", pizzaFlavors);

    agent.add(`Response from server, here is your order for ${qty} ${PizzaSize} ${pizzaFlavors} pizza.Your order is placed successfully!`);


  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('PlaceOrder', order);
  intentMap.set('Default Fallback Intent', fallback);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  _agent.handleRequest(intentMap);
});

// whatsapp integration
app.post("/twiliowebhook", async(req, res, next) => {

  let twiml = new twilio.twiml.MessagingResponse();
  console.log("twiliowebhook");
  console.log(req.body);

  console.log("message: ", req.body.Body);

  twiml.message(`Hello  ${req.body.ProfileName} welcome to my pizza shop!`);

  // // // todo: call dialogflow
  // Create a new session
const sessionClient = new dialogflow.SessionsClient(
  {
    keyFilename: "./google-credentials.json"
  }
);

  const projectId = "helloagent-cmvfbt"
  const sessionId = req.body.sessionId || "session123"
  const query = req.body.Body;
  const languageCode = "en-US"


  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId);



  // // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: query,
        // The language used by the client (en-US)
        languageCode: languageCode,
      },
    },
  };


  // console.log(request)
  // // Send request and log result

  const responses = await sessionClient.detectIntent(request).catch(err => {
    console.log(err)
  })
   
  // collecting text responses
   
  // collecting text responses
      
  {
    responses[0]?.queryResult?.fulfillmentMessages?.map(eachMessage => {
        if (eachMessage.platform === "PLATFORM_UNSPECIFIED" && eachMessage.message === "text") {
            twiml.message(eachMessage.text.text[0])
        }
    })
}
  
  res.header('Content-Type', 'text/xml');
  res.send(twiml.toString());

});

// react integeration

app.post("/talktochatbot", async (req, res, next) => {
  //body 
  // {
  //   query:user text
  // }
  //  todo call dialogflow API

  // console.log("sessionClient==>",sessionClient)

// Create a new session
const sessionClient = new dialogflow.SessionsClient(
  {
    keyFilename: "./google-credentials.json"
  }
);

  const projectId = "helloagent-cmvfbt"
  const sessionId = req.body.sessionId || "session123"
  const query = req.body.query;
  const languageCode = "en-US"


  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId);



  // // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: query,
        // The language used by the client (en-US)
        languageCode: languageCode,
      },
    },
  };


  // console.log(request)
  // // Send request and log result

  const responses = await sessionClient.detectIntent(request)

  // console.log('responses ==>', responses);
  // console.log('responses ==>', JSON.stringify(responses));
  // console.log("resp: ", responses[0].queryResult.fulfillmentText);
  // console.log("resp: ", responses[0].queryResult.fulfillmentText);
  let messages = [];

  // collecting text responses
  const customPayloadText = responses[0]?.queryResult?.webhookPayload?.fields?.null?.structValue?.fields?.text?.stringValue

  if (customPayloadText !== undefined) { // some thing in custom payload

    messages.push({
      sender: "chatbot",
      text: customPayloadText
    })

  } else {
    responses[0]?.queryResult?.fulfillmentMessages?.map(eachMessage => {
      if (eachMessage.platform === "PLATFORM_UNSPECIFIED" && eachMessage.message === "text") {

        messages.push({
          sender: "chatbot",
          text: eachMessage?.text?.text[0]
        })
      }
    })
  }
  res.send(messages);

  // }catch(err){

  // console.log("err=>",err)
}
  //  response:
  //{ sender: "chatbot", text: "hello from chatbot" }

  // }

);




