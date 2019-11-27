import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import * as common from './Common';
import logo from '../images/natasportslogo.png';

class Login extends Component {
    constructor(props) {
        super(props)

        this.props.changeTitle({ left: '', center: "Natan Sports", right: '' });
    }

    state = {
        data: {
            user: '',
            password: ''
        }
    }
    handleChange = (e) => {
        let data = this.state.data;
        data[e.target.id] = e.target.value;
        this.setState({ data });
    }
    login = () => {
        this.props.show();
        var that = this;
        common.postData('user/login', this.state.data).then(function (data) {

            that.props.hide();
            if (data !== 0) {
                common.setUser(data);
                window.location.href = '/';
            }
            else
                alert('Login Inválido!')
        });
    }
    _handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          this.login();
        }
      }
    componentDidMount() {

       
        setTimeout(() => {
            document.getElementById('user').className += " come-reverse-100";
            document.getElementById('password').className += " come-100";
            document.getElementById('div-btn').className += " come-100";


        }, 300);
    }
    render() {
        return (
            <div className="row login">
                <div className="col-12" >
                    <div className="mb-3 text-center mt-5 text-white fade-in" id="title">
                        <img src={logo} alt="" className="logo-login" />
                        {/* <div className="logo-text"> <b>HULK BET</b> </div>
                        <div className="logo-icons">
                            <i className="fas fa-futbol"></i>
                            <i className="fas fa-volleyball-ball"></i>
                            <i className="fas fa-football-ball"></i>
                            <i className="fas fa-baseball-ball"></i>
                        </div> */}
                    </div>
                </div>
                <div className="col-8 col-md-4 offset-md-4 offset-2">

                    <input type="email" id="user" className="form-control mb-2 user" onKeyDown={this._handleKeyDown}  value={this.state.data.user} placeholder="Login" onChange={this.handleChange.bind(this)} />
                    <input type="password" id="password" className="form-control mb-2 pass" onKeyDown={this._handleKeyDown}  placeholder="Senha" value={this.state.data.password} onChange={this.handleChange.bind(this)} />
                    <div id="div-btn" className="text-right div-btn">
                        <button onClick={this.login.bind(this)} type="button" className="btn btn-main" >Login</button>
                    </div>
                </div>
            </div>
        )
    }
}
export default withRouter(Login)
