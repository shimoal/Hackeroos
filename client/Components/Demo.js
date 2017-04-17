import React from 'react';
import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/monokai';
import Signup from './Auth/Signup';
import io from 'socket.io-client';
import axios from 'axios';
import { Link } from 'react-router';


let socket = io();

let localStream;

export default class Collaborate extends React.Component {

  constructor(props) {
    super(props);
    var d = new Date();
    this.state = {
      room_name: 'Demo' + d.getTime().toString(),
      code: '',
      info: '',
      exit_room: '',
      applyingChanges: false,
      username: 'demo user',
      success: true, //automatically set to true
      video: 'off',
    };
    this.updateEditorContent = this.updateEditorContent.bind(this);
    this.handleRunCode = this.handleRunCode.bind(this);
    this.updateResult = this.updateResult.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.ResetEditor = this.ResetEditor.bind(this);
    this.exitRoom = this.exitRoom.bind(this);
    this.handleExitRoom = this.handleExitRoom.bind(this);
    this.start = this.start.bind(this);
    this.startCall = this.startCall.bind(this);
    this.stopCall = this.stopCall.bind(this);
  }

  componentWillMount() {
    socket.emit('join-room', 'demo user', this.state.room_name);
    console.log('joined the demo room');
  }

  componentWillUnmount() {
    socket.emit('exit_room', 'demo user', this.state.room_name);
    console.log('left the demo room');
  }

  componentDidMount() {
    var context = this;   
    /*********** live coding *********/
    this.editor = ace.edit(this.refs.root);
    this.editor.getSession().setMode('ace/mode/javascript');
    this.editor.setTheme('ace/theme/monokai');
    this.editor.setShowPrintMargin(false);


    socket.on('clear-editor', this.ResetEditor);
    //'run code'
    socket.on('submit-val', this.updateResult);

    /**************************************/

    /*********** video conference *********/
    socket.on('description', this.handleEvent);
    
    socket.on('candidate', this.handleEvent);

    socket.on('stopCall', this.stopCall);
  }

  /************ live coding *************/

  updateEditorContent(val) {
    this.setState({applyingChanges: true});
    val = JSON.parse(val);
    this.editor.getSession().getDocument().applyDeltas([val]);
    this.setState({applyingChanges: false});
  }
  handleReset() {
    socket.emit('clear-editor', this.state.room_name);
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
  exitRoom() {
    this.stopCall(true);
    socket.emit('exit_room', this.state.username, this.state.room_name);

  }
  handleExitRoom() {
    this.setState({room_name: ''});
  }
  /************************************/

  /********* video conference *********/
  start(isCaller) {

    navigator.getUserMedia(
      { 'audio': true, 'video': true }, 
      function (stream) {
        $('#my-camera video')[0].src = URL.createObjectURL(stream);
        $('#peer-camera video')[0].src = URL.createObjectURL(stream);
        localStream = stream;
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
 
    localStream.getVideoTracks()[0].stop();
    this.setState({video: 'off'});
  }

  /************************************/    

  render() {
    return (
      <div>

      <div className="row">
        <h1>Welcome to our demo!</h1>
        <h2> This is a simulation of the collaboration page. Please log in to start collaborating with other users! </h2>
      </div>

        <div className='col-sm-9 col-md-9 main'>
          
          <div className="panel panel-default">
            <div className="panel-body">
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
        {

        <div className={this.state.success ? 'col-sm-3 col-md-3' : 'invisible'}>
          <div className="addTopBottomPadding">
            
            <button className={
              this.state.success && this.state.room_name ? 'btn btn-danger' : 'invisible'} 
              onClick={function() {alert('connection stopped')}}>Stop Connection</button>
            <div className={this.state.room_name ? 'addTopBottomPadding' : 'invisible'}>
              <p>You are in room: {this.state.room_name}</p>
            </div>
          </div>
        </div>

              }
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

            
      </div>

    );
  }
}