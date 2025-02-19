import React, {Component} from 'react';
import axios from 'axios';
import * as cons from '../const/const'
import '../css/bootstrap.min.css'
//import 'bootstrap';
import '../css/style.css'

class Bot extends Component {
    constructor(props) {
    super(props);
    this.initializeRecognition = this.initializeRecognition.bind(this);
    this.startRecognition = this.startRecognition.bind(this);
    this.stopRecognition = this.stopRecognition.bind(this);
    this.switchRecognition = this.switchRecognition.bind(this);
    this.setInput = this.setInput.bind(this);
    this.updateRec = this.updateRec.bind(this);
    this.readOutLoud = this.readOutLoud.bind(this);
    this.showHide = this.showHide.bind(this);
    this.inputKeyPress = this.inputKeyPress.bind(this);
    this.send = this.send.bind(this);
    this.setcommonResponse = this.setcommonResponse.bind(this);

    this.state = {
        isRecording: false,
        conversation: [],
        recognizer: new window.webkitSpeechRecognition()
    };
    
    }

    componentWillMount() {
        //console.log('componentWillMount');
    }

    componentDidMount() {
        this.initializeRecognition();
        //console.log('componentDidMount');
    }
    
	initializeRecognition(){
        try {
            if(!SpeechRecognition){		
                var SpeechRecognition = (
                   window.SpeechRecognition ||
                   window.webkitSpeechRecognition || 
                   window.mozSpeechRecognition || 
                   window.msSpeechRecognition
                  );
                
                this.state.recognizer.continuous = true;                
                this.state.recognizer.onstart = this.updateRec;
                
                this.state.recognizer.onresult = (event) => {
                    let text = "";
                    for (var i = event.resultIndex; i < event.results.length; ++i) {
                        text += event.results[i][0].transcript;
                    }
                    this.setInput(text);
                    this.stopRecognition();
                };
                this.state.recognizer.onerror = function(event) {
                  console.log(`Oops I got an ${event.error} error`);
                };
                this.state.recognizer.onend = this.stopRecognition;
                this.state.recognizer.lang = "en-US";
                //this.state.recognizer.lang = 'en-US';
                //this.state.recognizer.interimResults = false;
                //this.state.recognizer.maxAlternatives = 1;
                //this.state.recognizer.start();
            }
        }
        catch(error) {
          console.error('initializeRecognition error',error);
        }
    }


	startRecognition() {
        if (!!this.state.recognizer) {
            this.state.recognizer.start();
            this.state.isRecording = true;
            this.updateRec();
      }
      else{
          alert('Voice mic input is not supported in this version or browser,try with different version or browser.');
          console.log("Voice mic input is not available.");
      }
    }
  
    stopRecognition() {
      if (this.state.recognizer) {
        this.state.recognizer.stop();
        this.state.isRecording = false;
      }
      this.updateRec();
    }
  
    switchRecognition() {
    this.startRecognition();
    }
  
    setInput(text) {
      let inputElement = document.getElementById('input');
      inputElement.value = text;
      this.send();
    }
  
    updateRec() {   
      let recElement = document.getElementById('rec');
      let recVal = this.state.isRecording ? "..." : cons.micIcon;
      recElement.innerHTML = recVal;
    }
  
    inputKeyPress(event) {
        if (event.which == 13) {
            event.preventDefault();
            this.send();
            event.currentTarget.value = '';
        }
    }
  
/*-----------------------------
    Speech Synthesis 
------------------------------*/

    readOutLoud(message) {
  try {
      // var speech = new SpeechSynthesisUtterance();

      // //Set the text and voice attributes.Text can be maximum 32767 characters.
      // speech.text = message;
      
      // //sets the volume, accepts between [0 - 1], defaults to 1
      // speech.volume = 1;
      
      // //set the speed, accepts between [0.1 - 10], defaults to 1
      // speech.rate = 1;
      
      // //set the pitch, accepts between [0 - 2], defaults to 1
      // speech.pitch = 1;
      
      // //Values for the language
      // speech.lang = 'en-US'
      // //speech.lang = 'hi-IN'
    
      // window.speechSynthesis.speak(speech);
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(message));
      
  }
  catch(error) {
    console.error('SpeechSynthesisUtterance error',error);
  }
    }

    send() {
    let taResponse = document.getElementById('response');
    let body = document.getElementsByTagName('body')[0];
    let text = document.getElementById('input').value;
    document.getElementById('input').value = '';
    
    this.setState((state, props) => ({
        ...state,
        ...state.conversation.push("Sender: " + text + '\r\n')
    }));

    let serverUrl = "http://172.20.3.205:5000/send-msg",sendData = new URLSearchParams();
    
    sendData.append("MSG",text);
    console.log("pair",sendData);
    // for(const pair of new FormData(document.getElementById("input"))){
    //     sendData.append(pair[0],pair[1]);
    //     console.log("pair",pair);
    // }

    let url = cons.baseUrl + "query?v=20150910",
    data = JSON.stringify({ query: text, lang: "en", sessionId: "somerandomthing" });
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + cons.accessToken
      }
        
      axios.post(serverUrl, sendData)
      .then((res) => {
          console.log('res',res);
          var respText = res.data.result.fulfillment.speech;
          if(!respText){
              if(res.data.result.fulfillment.messages.length>0)
              for(let i=0;i<=res.data.result.fulfillment.messages.length-1;i++){
                  respText += res.data.result.fulfillment.messages[i].speech + '\r\n\n';
              }
              else{
                  respText = 'Please try again.';
              }
          }
          this.setcommonResponse(respText);
          this.readOutLoud(respText);
          //generateBanner(data);
          taResponse.scrollTop = taResponse.scrollHeight;
          body.scrollTop = body.scrollHeight;
      })
      .catch((err) => {
          console.log('axios.post err',err);
          this.setcommonResponse("Internal Server Error");
      })
        
    //   axios.post(url, data, {
    //   headers: headers
    //   })
    //   .then((res) => {
    //       console.log('res',res);
    //       var respText = res.data.result.fulfillment.speech;
    //       if(!respText){
    //           if(res.data.result.fulfillment.messages.length>0)
    //           for(let i=0;i<=res.data.result.fulfillment.messages.length-1;i++){
    //               respText += res.data.result.fulfillment.messages[i].speech + '\r\n\n';
    //           }
    //           else{
    //               respText = 'Please try again.';
    //           }
    //       }
    //       this.setcommonResponse(respText);
    //       this.readOutLoud(respText);
    //       //generateBanner(data);
    //       taResponse.scrollTop = taResponse.scrollHeight;
    //       body.scrollTop = body.scrollHeight;
    //   })
    //   .catch((err) => {
    //       console.log('axios.post err',err);
    //       this.setcommonResponse("Internal Server Error");
    //   })
    
    }


    setcommonResponse(val) {
    let responseElement = document.getElementById('response');
    this.setState((state, props) => ({
        ...state,
        ...state.conversation.push("Receiver: " + val + '\r\n\n')
    }));
    responseElement.value = this.state.conversation.join("");
    }

    showHide(e){
    e.preventDefault();
    let chatbotElement = document.getElementById('chatbot');
    let currTransform = getComputedStyle(chatbotElement).transform;
    if(currTransform === "matrix(1, 0, 0, 1, 0, -5.25)"){
        chatbotElement.style.transform="translateY(94%)";
    }
    else{
        chatbotElement.style.transform="translateY(-1%)";
    }
    }

    render() {
        return (
            <React.Fragment>

	<div className="container-fluid">
    <header>
        <div className="row">
        <div className="col-md-12 text-center mx-3 my-3">
        <img src={require('../css/images/LTLogo.png')} alt="L&T" width="25%"></img>
        </div>
        </div>
    </header>

    <div className="row">
        <div className="col-md-12">
        </div>
    </div>
    
    <div id="chatbot" className="fixed-right-bottom">
        <div  className="pull-right rounded border border-info">
            <div className="subheading" onClick={this.showHide}><h3>L&T</h3></div>
            <div className="col-md-12">
                
               <div className="form-group">
                 <label htmlFor="response">Chatbot:</label>
                <textarea readOnly className="form-control" id="response" cols="40" rows="15" ></textarea>
                </div>
            </div>
            <hr/>            
            <div className="col-md-12">
               <div className="form-group usr-inpt" id="usr-inpt">
                        <input id="input" type="text" className="form-control" placeholder="Type here..."
                        autoComplete="off" onKeyPress={this.inputKeyPress} />
                        <button id="rec" type="button" onClick={this.switchRecognition}>
                        <i className="fa fa-microphone" aria-hidden="true"></i>
                    </button>
                </div>
           </div>
        </div>
    </div>

</div>
</React.Fragment>

        )
    }
}
export default Bot