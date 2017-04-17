import React from 'react';
import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/monokai';
import Signup from './Auth/Signup';
import io from 'socket.io-client';
import axios from 'axios';
import { Link } from 'react-router';


let socket = io();
let pc;
let configuration = {
  'iceServers': [{
    'url': 'stun:stun.l.google.com:19302'
  }, {
    urls: 'turn:192.158.29.39:3478?transport=tcp',
    username: '28224511:1379330808', 
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA='
  }]
};

let localStream;

export default class Collaborate extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      room_name: '',
      code: '',
      info: '',
      exit_room: '',
      applyingChanges: false,
      username: '',
      success: false, //check if user successfully join a room
      video: 'off',
    };
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleJoinRoom = this.handleJoinRoom.bind(this);
    this.handleEditorContentChange = this.handleEditorContentChange.bind(this);
    this.updateEditorContent = this.updateEditorContent.bind(this);
    this.handleRunCode = this.handleRunCode.bind(this);
    this.updateResult = this.updateResult.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.setupEditor = this.setupEditor.bind(this);
    this.ResetEditor = this.ResetEditor.bind(this);
    this.handleInfo = this.handleInfo.bind(this);
    this.exitRoom = this.exitRoom.bind(this);
    this.handleExitRoom = this.handleExitRoom.bind(this);
    this.start = this.start.bind(this);
    this.startCall = this.startCall.bind(this);
    this.stopCall = this.stopCall.bind(this);
    this.handleEvent = this.handleEvent.bind(this);
  }

  componentWillMount() {
    console.log('COLLABORATE Username', this.props.userData.user.name);
    this.setState({username: this.props.userData.user.name});
  }

  componentDidMount() {
    var context = this;   
    /*********** live coding *********/
    this.editor = ace.edit(this.refs.root);
    this.editor.getSession().setMode('ace/mode/javascript');
    this.editor.setTheme('ace/theme/monokai');
    this.editor.setShowPrintMargin(false);

    socket.on('connect', function() {
      console.log(context.state.username, ' connected');
    });
    socket.on('disconnect', this.exitRoom);
    socket.on('room-exists', function(msg) {
      alert(msg);
    });
    socket.on('exit_room', this.handleExitRoom);
    // changes in editor
    this.editor.on('change', this.handleEditorContentChange);
    socket.on('editor-content-changes', this.updateEditorContent);
    socket.on('setup-editor', this.setupEditor);
    socket.on('clear-editor', this.ResetEditor);
    // 'run code'
    socket.on('submit-val', this.updateResult);
    // handle info
    socket.on('info', this.handleInfo);
    /**************************************/

		/*********** video conference *********/
    socket.on('description', this.handleEvent);
		
    socket.on('candidate', this.handleEvent);

    socket.on('stopCall', this.stopCall);
  }

  /************ live coding *************/
  handleFormChange(e) {
    this.setState({room_name: e.target.value});
  }

  handleJoinRoom(e) {
    var context = this;
    axios.get('/collaborates', {
      params: {
        room_number: context.state.room_name
      }
    })
    .then(function(collaborate) {
      console.log('collaborate.data ---> ', collaborate.data);
      context.setState({
        id: collaborate.data.id,
        learnerId: collaborate.data.id_learner,
        helperId: collaborate.data.id_helper,
        questionId: collaborate.data.id_question,
        learner: collaborate.data.Learner,
        helper: collaborate.data.Helper,
        question: collaborate.data.Question,
        room_name: collaborate.data.room_number
      });
      context.setState({success: true});
      socket.emit('join-room', context.state.username, context.state.room_name);
      console.log('context state ---> ', context.state);
    })
    .catch(function(err) {
      context.setState({info: 'Sorry, the room number does not exist!'});
    });
    e.preventDefault();
  }
  handleEditorContentChange(e) {
    if (!this.state.applyingChanges) {
      socket.emit('editor-content-changes', this.state.room_name, JSON.stringify(e));
    }
    return false;
  }
  updateEditorContent(val) {
    this.setState({applyingChanges: true});
    val = JSON.parse(val);
    this.editor.getSession().getDocument().applyDeltas([val]);
    this.setState({applyingChanges: false});
  }
  handleReset() {
    socket.emit('clear-editor', this.state.room_name);
  }
  setupEditor(val) {
    this.setState({applyingChanges: true});
    var context = this;
    val.forEach(function(element) {
      element = JSON.parse(element);
      context.editor.getSession().getDocument().applyDeltas([element]);
    });
    this.setState({applyingChanges: false});
  }
  ResetEditor() {
    this.editor.getSession().setValue('');
  }
  handleRunCode() {
    var val = this.editor.getValue();
    socket.emit('submit-val', this.state.room_name, val);
    return false;
  }
  updateResult(results) {
    var resultsArr = [];
    for (var i = 0; i < results.length; i++) {
      resultsArr.push(<div key={i}>{results[i]}</div>);
    } 
    this.setState({applyingChanges: true});
    this.setState({results: resultsArr});
    this.setState({applyingChanges: false});
  }
  handleInfo(msg) {
    this.setState({info: msg});
  }
  exitRoom() {
    this.stopCall(true);
    console.log('exit_room room_name', this.state.room_name);
    socket.emit('exit_room', this.state.username, this.state.room_name);

  }
  handleExitRoom() {
    this.setState({info: 'You left the room'});
    this.setState({room_name: ''});
  }
  /************************************/

  /********* video conference *********/
  start(isCaller) {
    console.log('inside start');
    var room_name = this.state.room_name;

    //pc will be created for both caller and answerer
    pc = new RTCPeerConnection(configuration);


    // send any ice candidates to the other peer
    pc.onicecandidate = function (evt) {
      console.log('sending ice candidate:', evt);
      socket.emit('sendCandidate', room_name, (JSON.stringify({ 'candidate': evt.candidate })));
    };

    // once remote stream arrives, show it in the remote video element
    pc.onaddstream = function (evt) {      
      $('#peer-camera video')[0].src = URL.createObjectURL(evt.stream);
    };

    // get the local stream, show it in the local video element and send it
    navigator.getUserMedia(
      { 'audio': true, 'video': true }, 
      function (stream) {
        $('#my-camera video')[0].src = URL.createObjectURL(stream);
        pc.addStream(stream);
        if (isCaller) {
          pc.createOffer(gotDescription, function(err) { console.log('error: ', err); });          
        } else {
          pc.createAnswer(gotDescription, function(err) { console.log('error: ', err); });          
        }

        localStream = stream;

        function gotDescription(desc) {
          pc.setLocalDescription(desc);
          socket.emit('sendDescription', room_name, JSON.stringify({ 'sdp': desc }));
        }
      }, 
    function(err) {
      console.log('there was an error getting the getUserMedia');
      console.log(err);
    });
  }


  startCall() {
    this.start(true);
    this.setState({video: 'on'});
  }

  stopCall(isStopper) {
    console.log('inside stop call', isStopper);
    if (isStopper) {
      console.log('emitting stopCall to ' + this.state.room_name);
      socket.emit('stopCall', this.state.room_name);
    }
    console.log('removing stream', localStream);
    if (pc !== undefined) { //To handle stop connection (leave the room) without video connection being initiated
      pc.removeStream(localStream);  
      localStream.getVideoTracks()[0].stop();
      this.setState({video: 'off'});
    }
  }

  handleEvent(evt) {
    if (!pc) {
      this.start(false);    
    }

    var event = JSON.parse(evt);
    if (event.sdp) {
      var description = (JSON.parse(evt)).sdp;
      if (!!description) {
        pc.setRemoteDescription(new RTCSessionDescription(description));      
      }
  
    } else if (event.candidate) {
      var candidate = event.candidate;
      if (!!candidate) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));       
      }

    }

  }

	/************************************/	  

  render() {

    return (

      <div className="row">

        {
          this.state.success ? null :
          (
            <div className="container">
              <div className="col-sm-4 col-md-4 col-lg-4">
              </div>
              <div className="col-sm-4 col-md-4 col-lg-4 text-center">
                <form id="joinRoomForm" onSubmit={this.handleJoinRoom}>
                  <p>&nbsp;</p>
                  <p>&nbsp;</p>
                  <h3>Enter a room number</h3>
                  <div className="row">
                    <div className="col-sm-1 col-md-2 col-lg-2">
                    &nbsp;
                    </div>
                    <div className="col-sm-9 col-md-7 col-lg-7">
                      <input id="roomName" className="form-control" onChange={this.handleFormChange} type="text" name="roomName" placeholder="room number" />
                    </div>
                    <div className="col-sm-2 col-md-3 col-lg-3">
                      <input type="submit" value="Join" className="btn btn-success btn-fill" />
                    </div>
                    <div>
                      <p>&nbsp;</p>
                      <p>{this.state.info}</p>
                    </div>
                  </div>
                </form> 
              </div>
              <div className="col-sm-4 col-md-4 col-lg-4">
              </div>
            </div>
          )
        } 


        <div className={this.state.success ? 'col-sm-9 col-md-9 main' : 'invisible'}>
          
          <div className="panel panel-default">
            <div className="panel-body">
              

              {this.state.success ? 
                (
                  
                  <div>
                    <h5>{this.state.question.title}</h5>
                    <p>{this.state.question.question}</p>
                  </div>

                ) : null
              }
                
            </div> 
          </div>
         
          <div className={this.state.success ? '' : 'invisible'}>
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">Live Coding</h3>
                </div>
                <div className="panel-body">
                  
                  <div id="editor" ref="root"></div>
                  
                  <div className="btn-group addTopBottomPadding" role="group" aria-label="...">
                    <button onClick={this.handleReset} type="button" id="reset" className="btn btn-default">Clear</button>
                    <button onClick={this.handleRunCode} type="button" id="run" className="btn btn-default">Run</button>
                  </div>
                  
                  <div className="well result">{this.state.results}</div>
                </div>
              </div>
            </div>
        </div>

        <div className={this.state.success ? 'col-sm-3 col-md-3' : 'invisible'}>
          <div className="addTopBottomPadding">
            
            <button className={
              this.state.success && this.state.room_name ? 'btn btn-danger' : 'invisible'} 
              onClick={this.exitRoom}>Stop Connection</button>
            <div className={this.state.room_name ? 'addTopBottomPadding' : 'invisible'}>
              <p>You are in room: {this.state.room_name}</p>
            </div>

            <p>{this.state.info}</p>
            
            <p></p>
            { this.state.video === 'off' ? 
              <button className="btn btn-success btn-fill" onClick={this.startCall.bind(this, true)} >Turn On Camera</button> 
              : <button className="btn btn-success" onClick={this.stopCall.bind(this, true)} >Turn Off Camera</button> 
            }
            <p></p>
            <div id="my-camera">
              <video autoPlay muted="muted"></video>
            </div>

            <div id="peer-camera">
              <video width="400" height="400" autoPlay></video>
            </div>          
            {
              (this.state.id && this.state.learner.name === this.state.username) ? 
                (
                  <button className="btn btn-success">
                    <Link to={'/review/' + this.state.questionId + '/' + this.state.id }>Write Review</Link>
                  </button>

                ) : null
            }
          </div>
        </div>

      </div>

    );
  }
}
