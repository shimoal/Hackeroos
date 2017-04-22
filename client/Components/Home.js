import React from 'react';
import { Link } from 'react-router';
import OpenQuestions from './OpenQuestions';
import HomepageSearchBar from './HomepageSearchBar';
import HelperProfiles from './HelperProfiles';


export default class Home extends React.Component {

  componentWillMount() {

  }
  
//   constructor() {
//     super(); 



//   }

//   // //Before component is rendered
//   // componentWillMount() {
//   //   console.log('Home component is mounting');
//   //   //check to make sure user is authenticated and set state to 1 or 0
//   //   this.props.checkUserAuth();
//   // }

//   //Happens after component has rendered
//   componentDidMount() {
//     console.log('Home component has rendered');

// // every component needs to do GET /session to check if the user has been authenticated!!!!
// // need to pass down the following function as props to all components

//   }
  
//   //Happens when component has rendered and about to unmount
//   componentWillUnmount() {
//     // this.props.showSearch('no');
//   }

  //Happen whenever home component's state changes
  render() {
    console.log('Home component is rendered');
    return (
      <div className="row">
      <HomepageSearchBar getSearchResults={this.props.getSearchResults}/>
        <div className="col-sm-1 col-md-1"/>
        
        <div className="col-sm-10 col-md-10">
          { /* OpenQuestions.js */}
          <OpenQuestions 
            userCurrent={this.props.userData.user}
            questions={this.props.userData.questions}
            claimQuestion={this.props.claimQuestion} />

          { /* FindHelpers Compoent */}
          <HelperProfiles allUsers={this.props.userData.allUsers} allRatings={this.props.userData.ratings}/>

        </div>

        
      </div>


      
    );
  }
}