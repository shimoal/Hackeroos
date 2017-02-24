import React from 'react'
import Helpers from './Helpers'

var QuestionItem = React.createClass({
  //do conditional rendering
  //if helper's children exist, then render the Helpers component
  render: function() {
    return (
      <div>
        <table className="table table-striped">
          <tbody>
            <tr>
              <td><h4><a href="">{this.props.details.title}</a></h4></td>
            </tr>
            <tr>
              <td><p>{this.props.details.question}</p></td>
            </tr>
            <tr>
              <td><a href="">Edit</a> | <a href="">Remove</a></td>
            </tr>
          </tbody>
        </table>

        <Helpers/>
      </div>
    )
  }
})

export default QuestionItem