import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import './App.css';
import Menu from './components/Menu';
import Bet from './components/Bet';
import Login from './components/Login';
import loadingImage from './images/loading-spinner.svg';
import User from './components/admin/User';
import Passenger from './components/admin/Passenger';
import Crew from './components/admin/Crew';
import Expense from './components/admin/Expense';
import Airplane from './components/admin/Airplane';
import Parameter from './components/admin/Parameter';

import * as common from './components/Common';

import { BrowserRouter,  Route } from 'react-router-dom'

class App extends Component {
  constructor(props) {
    super(props);
   
    if (window.location.pathname !== '/site/login' && common.getUser() === null)
      return window.location.href = "/site/login";
  }
  state = {
    title: { left: '', center: "I bet you bet!", right: '' },
    loading: '',
  }
  changeTitleHandler = title => {
    this.setState({ title: title });
  }
  loadingShow = () => {
    this.setState({ loading: 'loading-show' });
  }
  loadingHide = () => {
    this.setState({ loading: '' });
  }
  componentDidMount() {

  }
  dateChanged = (e) => {
    this.setState({ year: e.target.value });
  }
  render() {

    return (
      <React.Fragment>
        <div className="navigation-bar row no-gutters" >
          <div className="col-12 row no-gutters">
            <div className="col text-left align-self-center" >{this.state.title.left}</div>
            <div className="col-auto text-center align-self-center" >{this.state.title.center}</div>
            <div className="col text-right align-self-center" >{this.state.title.right}</div>
          </div>
        </div>

        <BrowserRouter basename="/site">
          <div className="page p-1">

            {window.location.pathname === '/site/login' || <Menu show={this.loadingShow} hide={this.loadingHide} />}
            <Route path="/login" render={() => <Login changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/" exact render={() => <Bet changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/default" />
            <Route path="/admin/user" render={() => <User changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/admin/passenger" render={() => <Passenger changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/admin/crew" render={() => <Crew changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/admin/expense" render={() => <Expense changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/admin/airplane" render={() => <Airplane changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/admin/parameter" render={() => <Parameter changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />

          </div>
        </BrowserRouter>
        <div className={'loading ' + this.state.loading} ><img src={loadingImage} alt="" /></div>

      </React.Fragment>
    );
  }
}

export default App;
