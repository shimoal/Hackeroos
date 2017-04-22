import React from 'react'
import ReactStars from 'react-stars'
import axios from 'axios'


export default class LeftColumn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile_img: this.props.userCurrent.profile_img,
      id: this.props.userCurrent.id,
      ratings: this.props.userRating
    }
  }

  componentWillMount() {
    this.setState({ratings: this.props.userRating});
  }

  render() {
    console.log('this.props', this.props);
    console.log('this.state', this.state);

    return (
      <div className="col-sm-4 col-md-3 sidebar">
      
        <div className="row placeholders">
          <div className="placeholder">
            <img src={this.props.userCurrent.profile_img} width="200px"/>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <tbody>
              <tr>
                <td><p>Overall Rating</p></td>
                <td>
                  <ReactStars
                    value={this.props.userRating ? this.props.userRating.averageOverall : 0}
                    count={5}
                    half={false} 
                    edit={false} />
                </td>
              </tr>
              <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td><p>Knowledge</p></td>
                <td>
                  <ReactStars
                    value={this.props.userRating ? this.props.userRating.averageKnowledge : 0}
                    count={5}
                    half={false}
                    edit={false}/>
                  </td>
              </tr>
              <tr>
                <td><p>Helpfulness</p></td>
                <td>
                  <ReactStars
                    value={this.props.userRating ? this.props.userRating.averageHelpfulness: 0}
                    count={5}
                    half={false}
                    edit={false}/>
                </td>
              </tr>
              <tr>
                <td><p>Overall Experience</p></td>
                <td>
                  <ReactStars
                    value={this.props.userRating ? this.props.userRating.averageExperience: 0}
                    count={5}
                    half={false}
                    edit={false}/>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
      </div>
    )
  }
}
