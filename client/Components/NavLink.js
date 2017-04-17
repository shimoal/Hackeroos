import React from 'react';
import { Link } from 'react-router';
import style from '../sass/NavLink.scss';

export default React.createClass({
  
  displayLoginLogout() {
    if (this.props.userData.user.name) {
      return (
        <li><Link to="/logout">Logout</Link></li>
        )
    } else {
      return (<li><Link to="/signup">Login/Signup</Link></li>)
    }
  },
  displayDashboardLink() {
    if (this.props.userData.user.name) {
      return (<li><Link to="/dashboard">My Dashboard</Link></li>)
    }
  },

  render() {
    return (
      <div id="navbar">
      <nav className="navbar navbar-ct-blue navbar-fixed-top Navbar-transparent" role="navigation">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <Link className="navbar-brand" to="/">Hackeroo</Link>
          </div>

          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav">
              <li><Link to="/about">How it works</Link></li>
              <li><Link to="/graphs">View coding trends</Link></li>
              <li><Link to="/demo">Demo</Link></li>
              <li><Link to="/collaborate">Collaborate</Link></li>
              {this.displayDashboardLink()}
              {this.displayLoginLogout()}

            </ul>
          </div>
        </div>
      </nav>  
      </div>
    );
  }
});
