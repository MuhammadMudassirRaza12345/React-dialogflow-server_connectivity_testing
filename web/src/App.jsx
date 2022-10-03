
import './App.css';

import { useState } from "react";
import axios from "axios";
import { Button, Form, Stack, Container, Row, Col } from 'react-bootstrap';



function ChatWindow() {

  const [userText, setUserText] = useState("");
  const [messages, setMessages] = useState([]);

  // setUserText("sdkjfhdkfjs");
  // setUserText((prev)=>{
  //   return prev + " some new value";
  // })

  const sendMessage = async (e) => {
    e.preventDefault();

    if(userText === "") return;


   console.log("sending message");
    setMessages((prev) => (
      [{ sender: "user", text: userText }, ...prev]
    ));

    // TODO: send message on dialogflow and get reply
    let response = await axios.post("http://localhost:5000/talktochatbot", {
      query: userText,


    })
    // const data = response.data;
    setMessages((prev) => (
          [...response.data, ...prev]
        ));

    setUserText("");
    e.target.reset();

    // setTimeout(() => {
    //   setMessages((prev) => (
    //     [{ sender: "chatbot", text: "hello from chatbot" }, ...prev]
    //   ));
    // }, 1000);

  }


  return <>
    <h1 className='heading'>CHAT APP</h1>

    <form onSubmit={sendMessage} className="form">

      <Stack direction="horizontal" gap={3}>
        <Form.Control className="me-auto inputField" type="text" placeholder="Enter your text here" onChange={(e) => { setUserText(e.target.value) }} />
        <Button type='submit' variant="secondary"  className='submitButton'>Submit</Button>
      </Stack>

    </form>

    <div>


      <Container>
        {messages.map((eachMessage, index) => (
          (eachMessage.sender === "user") ?
            (<Row key={index}>
              <Col xs={3}></Col>
              <Col className='message user-message'>{eachMessage.text}</Col>
            </Row>)
            :
            (<Row key={index}>
              <Col className='message chatbot-message'>{eachMessage.text}</Col>
              <Col xs={3}></Col>
            </Row>)

        ))}
      </Container>





    </div>



  </>
}




function App() {
  return <ChatWindow />;
}
export default App;