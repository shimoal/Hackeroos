import React from 'react';
import { Link } from 'react-router';
import ReactStars from 'react-stars'

export default React.createClass({

  constructProfileLink() {
    return 'profile/' + this.props.details.id;
  },

  render() {
    
    return (
      <div className="col-xs-6 col-sm-3 placeholder">
        <img src={this.props.details.profile_img} width="200px"/>
        <h3><Link to={this.constructProfileLink()}>{this.props.details.name}</Link></h3>
        
        <p>&nbsp;</p>
        {this.props.details.reviewRatings !== undefined ? (
          <div>
            <table className="table table-condensed">
            <tbody>
              <tr>
                <td><p>Overall</p></td>
                <td>
                  <ReactStars 
                    value={this.props.details.reviewRatings.averageOverall}
                    count={5}
                    half={false}
                    edit={false}/>
                </td>
              </tr>
              <tr>
              </tr>
              <tr>
                <td><p>Knowledge</p></td>
                <td>
                  <ReactStars
                    value={this.props.details.reviewRatings.averageKnowledge}
                    count={5}
                    half={false}
                    edit={false}/>
                </td>
              </tr>
              <tr>
                <td><p>Helpfulness</p></td>
                <td>
                  <ReactStars 
                    value={this.props.details.reviewRatings.averageHelpfulness}
                    count={5}
                    half={false}
                    edit={false}/>
                </td>
              </tr>
              <tr>
                <td><p>Overall Experience</p></td>
                <td>
                  <ReactStars 
                    value={this.props.details.reviewRatings.averageExperience}
                    count={5}
                    half={false}
                    edit={false}/>
                </td>
              </tr>
            </tbody>
          </table> 
          
            
          </div> 
          ) : (
          <p>no reviews</p>
          )
        }
        

      </div>
    );
  }
});


  
  