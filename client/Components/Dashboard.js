import React from 'react';
import { Link } from 'react-router';
import LeftColumn from './LeftColumn';
import RightColumn from './RightColumn';
import RightColumnPublic from './RightColumnPublic';
import Signup from './Auth/Signup';
import { browserHistory } from 'react-router';
import axios from 'axios'


export default React.createClass({

  getInitialState: function() {
    return {
      dashboard: 1, //used by OpenQuestions component to render "My Open Questions" heading
    };
  },

  componentWillMount() {
    if (this.props.params.userId !== undefined) { // if public (check React Route params)
      this.props.getUserPublicProfile(this.props.params.userId);
      this.props.getUserPublicQuestions(this.props.params.userId);
    }
  },

  componentDidMount() {
    if (this.props.userData.user.id !== undefined) {
      var userId = this.props.userData.user.id;
      console.log(userId);
      console.log('userId:', this.props.userData);

      var data = {
        userId: userId
      };

      this.props.getUserQuestions(data);
      this.props.getUserClaimedQuestions(data);
    }
  },

  publicOrPrivate: function() {
    if (this.props.params.userId !== undefined) { // if public (check React Route params)
      return (
        <div className="container-fluid">
          <div className="row">
            <LeftColumn userCurrent={this.props.userData.userPublicProfile} 
              userRating={this.props.userData.ratings[this.props.userData.userPublicProfile.id]} />            
            <RightColumnPublic 
              // dashboard={this.state.dashboard}
              // authenticated={this.props.userData.authenticated} //need to pass this to enable claim button
              userCurrent={this.props.userData.userPublicProfile}
              questions={this.props.userData.userPublicQuestions}
              authenticated={this.props.userData.authenticated} />
          </div>
        </div>
      );
    } else { //private
      if (this.props.userData) {
        return (
          <div className="container-fluid">
            <div className="row">
              <LeftColumn userCurrent={this.props.userData.user} 
                userRating={this.props.userData.ratings[this.props.userData.user.id]} />
              <RightColumn 
                dashboard={this.state.dashboard}
                userCurrent={this.props.userData.user}
                authenticated={this.props.userData.authenticated}
                questions={this.props.userData.currentUserQuestions}
                questionsClaimed={this.props.userData.questionsClaimed} 
                acceptHelper={this.props.acceptHelper}
                addQuestion={this.props.addQuestion} />
            </div>
          </div>
        );
      } else {
        return (
          <div>
            <Signup/>
          </div>
        );
      }
    }
  }, 

  render() {
    return (
      <div>
        { this.publicOrPrivate() }
      </div>
    );
  }
});
