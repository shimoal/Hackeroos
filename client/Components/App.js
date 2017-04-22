import React from 'react';
import { browserHistory, IndexLink } from 'react-router';
import axios from 'axios';
import NavLink from './NavLink';
import style from '../sass/App.scss';
import Primose from 'bluebird';

//redux experiment
// import ContainerOne from '../containers/ContainerOne';
// import ContainerTwo from '../containers/ContainerTwo';

export default class App extends React.Component {

  constructor(props) {
    super(props); 

    this.state = {

      user_skills: {},
      ratings: {},
      questions: {},
      userPublicQuestions: {},
      questionsClaimed: {},
      currentUserQuestions: {},
      allUsers: [],
      userPublicProfile: {},
      user: {},
      searchResults: {}
    };
    this.getUserQuestions = this.getUserQuestions.bind(this);
    this.getUserClaimedQuestions = this.getUserClaimedQuestions.bind(this);
    this.getAllRatings = this.getAllRatings.bind(this);
  }

  componentWillMount() {
    //we can't call 'this' within axios, so need to hold it in 'context'
    //this will set the user if there is a current session but no user
    if (!this.state.user.name) {
      //Check Authentication Session
      axios.get('/session')
      .then(response => {

        //check to make sure response is a user (has a name propterty)
        if (response.data.name) {
          this.setState({user: response.data});

          var data = {
            userId: response.data.id
          };
          //get users questions and claims
          this.getUserQuestions(data);
          this.getUserClaimedQuestions(data);
        } else {
          console.log('user is not authenticated');
        }

      }).catch(err => {
        console.log('Error checking User\'s Authentication Session');
        console.log(err);
      });
    } // ------- End of check authentication session

    
    //Get all questions
    this.getAllQuestions();


    //Get all users
    axios.get('/users')
    .then(response => {
      console.log('========== Success getting All Users from DB');
      //response.data object is in an array, so need to get element 0
      this.setState({allUsers: response.data});
    })
    .then(() => this.getAllRatings())
    .catch(err => {
      console.log('Error getting All Users from DB');
      console.log(err);
    }); // -------- End of get all users

    //get User's questions and claims if they already exist
    if (this.state.user.name) {
      var data = {
        userId: this.state.user.id
      };
      this.getUserQuestions(data);
      this.getUserClaimedQuestions(data);
    }

  }

  getAllQuestions() {
    axios.get('/question')
    .then(response => {
      // console.log('========== Success getting All Questions from DB');
      //response.data object is in an array, so need to get element 0
      // console.log('questions:', response);
      this.setState({questions: response.data});
    })
    .catch(err => {
      console.log('Error getting All Questions from DB');
    });
  }

  getUserQuestions(data) {
    //do ajax call to get current user questions
    console.log('data is ', data);
    axios.get('/question-for-one-user', { params: data })
    .then(response => {
      // console.log('========== Success getting Current User\'s Questions data from DB');
      console.log('currentUserQuestions is', response.data);
      this.setState({currentUserQuestions: response.data});
    })
    .catch(err => {
      console.log('Error getting Current User\'s Questions data from DB');
      console.log(err);
    });
  }

  getUserClaimedQuestions(data) {
        //do ajax call to get claimed questions
    axios.get('/claim', { params: data })
    .then(response => {
      // console.log('========== Success getting Current User\'s Claimed questions from DB', response);
      //response.data object is in an array, so need to get element 0
      this.setState({questionsClaimed: response.data});
    })
    .catch(err => {
      console.log('Error getting Current User\'s Claimed questions from DB');
    });
  }

  addQuestion(questionData) {
    var timeStamp = (new Date()).getTime();
    axios.post('/question', questionData)
    .then(res => {
      // console.log('========== Success writing question to database');
      
      //Get poster's questions
      this.getUserQuestions({userId: questionData.userId});

      //Get all questions
      this.getAllQuestions();


    })
    .catch(err => {
      if (err) {
        console.log('Error writing question to database', err);
      }
    });  
  }

  getUserPublicQuestions(userId) {
    //get user's questions
    var data = {
      userId: userId,
    };
    axios.get('/question-for-one-user', { params: data })
    .then(response => {
      // console.log('========== Success getting User\'s Public Profile Questions for', userId);
      // console.log(response.data);
      this.setState({userPublicQuestions: response.data});
    })
    .catch(err => {
      console.log('Error getting User\'s Public Profile Questions for', userId);
    });
  }

  claimQuestion(currentUserId, learnerId, questionId) {
    axios.post('/claim', {id_helper: currentUserId, id_learner: learnerId, id_question: questionId})
    .then(res => {
      // console.log('========== Success writing claim to database');
    })
    .catch(err => {
      if (err) {
        console.log('Error writing claim to database');
      }
    });
  }

  //user click on accept button
  acceptHelper(learnerId, helperId, questionId) {
    
    //create session table
    axios.post('/accept', {
      id_learner: learnerId, 
      id_helper: helperId, 
      id_question: questionId,
    })
    .then(res => {
      console.log('========== Success saving collaborate session');
      // setState to include learnerId, helperId, questionId, roomNumber?
      // redirect to collaborate?
    })
    .catch(err => {
      if (err) {
        console.log('Error saving collaborate session', err);
      }
    });
  }

  getUserPublicProfile(userId) {
    var data = {
      userId: userId,
    };
    axios.get('/public-profile', { params: data })
    .then(response => {
      // console.log('========== Success getting User Public Profile data from DB');
      this.setState({userPublicProfile: response.data});
    })
    .catch(err => {
      if (err) {
        console.log('Error getting User Public Profile data from DB');
      }
    });
  }

  getSearchResults(searchTerm) {
    console.log('inside getSearchResults: ', searchTerm);
    axios.get('/search', {params: {term: searchTerm}}) //+ document.getElementsByName("textbox1")[0].value)
          .then(response => {
            // console.log('searchResp: ', response);
            this.setState({searchResults: response.data});
            browserHistory.push('/searchresults');
          // comp.setState({questions: response.data[0].title});
          })
          .catch(err => {
            console.log('Error getting search results:', err);
          });
  }

  removeUser() {
    this.setState({questionsClaimed: {}});
    this.setState({currentUserQuestions: {}});
    this.setState({user: {}});
  }

  getAllRatings() {
    var context = this;
    var ratingPromises = this.state.allUsers.map(user => {
      return context.getOneRating(user.id);
    });

    Promise.all(ratingPromises)
      .then((data) => {
        data.forEach(ratingsForId => {
          var copy = Object.assign({}, context.state.ratings);
          copy[ratingsForId.id] = ratingsForId;
          context.setState({ratings: copy});
        }) 
      });
  }

  getOneRating(id) {
    
    return axios.get('/review-getByUserId/' + id )
      .then((response) => {
        var overallTotal = 0;
        var helpfulnessTotal = 0;
        var experienceTotal = 0;
        var knowledgeTotal = 0;
        
        var count = 0;

        response.data.forEach(review => {
          count += 1;
          overallTotal += review.overall;
          helpfulnessTotal += review.helpfulness;
          knowledgeTotal += review.knowledge;
          experienceTotal += review.experience;
        });

        var averageOverall = count > 0 ? Math.floor(overallTotal / count) : 0;
        var averageKnowledge = count > 0 ? Math.floor(knowledgeTotal /count) : 0;
        var averageHelpfulness = count > 0 ? Math.floor(helpfulnessTotal / count) : 0;
        var averageExperience = count > 0 ? Math.floor(experienceTotal / count) : 0;

        return {
          'id': id,
          'averageOverall': averageOverall,
          'averageKnowledge': averageKnowledge,
          'averageHelpfulness': averageHelpfulness,
          'averageExperience': averageExperience
        };
      })
      .catch(err => {
        console.log('error in get all reviews for user', err.message)
      });

  }

  render() {
    console.log('inside App render');
    const childrenWithProps = React.Children.map(this.props.children,
      (child) => React.cloneElement(child, {
        userData: this.state,
        getUserQuestions: this.getUserQuestions.bind(this),
        getUserClaimedQuestions: this.getUserClaimedQuestions.bind(this),
        addQuestion: this.addQuestion.bind(this),
        claimQuestion: this.claimQuestion.bind(this),
        acceptHelper: this.acceptHelper.bind(this),
        getUserPublicProfile: this.getUserPublicProfile.bind(this),
        getUserPublicQuestions: this.getUserPublicQuestions.bind(this),
        removeUser: this.removeUser.bind(this),
        getSearchResults: this.getSearchResults.bind(this),
        getAllRatings: this.getAllRatings.bind(this),
        getOneRating: this.getOneRating.bind(this)
      })
    );
    
    return (
      <div>
        
        <NavLink userData={this.state}/>
        {childrenWithProps}

      </div>
    );
  }
}
