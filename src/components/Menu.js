import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';
import logo from '../images/natasportslogo.png';

class Menu extends Component {

  componentWillReceiveProps() {

  }
  redirect = (path, e) => {

    if (document.location.pathname !== path)
      this.props.history.push(path);
    else {
      this.props.history.push('/default');
      setTimeout(() => {
        this.props.history.push(path);
      }, 1);
    }

  }
  render() {

    return (
      <React.Fragment>
        <div className="menu-more " id="menu-more" onClick={common.hideMore} >
          <div className="text-center mb-3 logo-text">
            NATAN SPORTS
            {/* <div className="logo-icons">
              <i className="fas fa-futbol"></i>
              <i className="fas fa-volleyball-ball"></i>
              <i className="fas fa-football-ball"></i>
              <i className="fas fa-baseball-ball"></i>
            </div> */}
          </div>
          <div className="col-md-8 offset-md-2 menu-item pt-2">
            <div>
              <div>Bem-Vindo <b>{common.getUser() ? common.getUser().first_name : ""}!</b></div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/')}  ><i className="fas fa-futbol"></i> Consolidado</div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/bet-fixed')}  ><i className="fas fa-mountain"></i> Consolidado (Cadastro de Montantes)</div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/closing')}  ><i className="fas fa-book-open"></i> Fechamento</div>
            </div>
            <div>
                <div  onClick={this.redirect.bind(this, '/risk-profit')}  ><i className="fas fa-chart-line"></i> Risco e Lucro</div>
            </div>
            <div>
                <div onClick={this.redirect.bind(this, '/risk-profit-cev')}  ><i className="fas fa-chart-bar"></i> Risco CEV</div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/reports')}  ><i className="fas fa-chart-bar"></i> Indicadores</div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/admin/bet')}  ><i className="fas fa-dice"></i> Apostas</div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/admin/betlogin')}  ><i className="fas fa-key"></i> Contas BET 365</div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/admin/bookmaker')}  ><i className="fas fa-users"></i> Clientes</div>
            </div>
            <div >
              <div onClick={this.redirect.bind(this, '/admin/matrix')}  ><i className="fas fa-users"></i> Matrizes</div>
            </div>
            <div >
              <div onClick={this.redirect.bind(this, '/admin/user')}  ><i className="fas fa-user-circle"></i> Usuários</div>
            </div>
            {/* <div>
              <div onClick={this.redirect.bind(this, '/admin/parameter')}  ><i className="fas fa-cogs"></i> Parâmetros</div>
            </div> */}
            <div >
              <div onClick={() => { common.setUser(null); this.redirect('/login') }}  ><i className="fas fa-sign-out-alt"></i> Sair</div>
            </div>
          </div>
        </div>
        <div className="menu row no-gutters hidden" >
          <div className="col-md-8 offset-md-2 row no-gutters">
            <div className="col" >
              <div onClick={this.redirect.bind(this, '/')}  ><i className="fas fa-futbol"></i><div>Consolidado</div></div>
            </div>
            <div className="col" >
              <div onClick={this.redirect.bind(this, '/risk-profit')}  ><i className="fas fa-chart-bar"></i><div>Risco</div></div>
            </div>
            <div className="col" >
              <div ><i className="fas fa-chart-bar"></i><div>Geral</div></div>
            </div>
            {/* <div className="col" >
              <div onClick={this.showMore.bind(this)}  ><i className="fas fa-bars"></i><div>Mais</div></div>
            </div> */}
          </div>
        </div>

      </React.Fragment>
    );
  }
}

export default withRouter(Menu);
