import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';

class Menu extends Component {
 
  componentWillReceiveProps(){
   
  }
  redirect = (path) => {

    if (document.location.pathname !== path)
      this.props.history.push(path);
    else {
      this.props.history.push('/default');
      setTimeout(() => {
        this.props.history.push(path);
      }, 1);
    }

  }
  redirectLastLeg() {
    this.props.show();
    common.getData('flight-leg-last').then((data) => {
      this.props.hide();
      if (data === "0")
        return alert('Ainda não há nenhum trecho cadastrado');
      this.redirect('/leg-expense/' + data.flight_id + '/' + data.id + '?id=new');
    });
  }

  showMore(e) {
    e.stopPropagation();
    document.getElementById('menu-more').className = 'menu-more menu-come';
    document.body.addEventListener('click', common.hideMore);
  }

  render() {

    return (
      <React.Fragment>
        <div className="menu-more" id="menu-more" >
          <div className="col-md-8 offset-md-2">
          <div>
              <div>I bet you bet!<b>{common.getUser() ? common.getUser().name : ""}!</b></div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/admin/airplane')}  ><i className="fas fa-plane"></i> Aeronave</div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/admin/user')}  ><i className="fas fa-user-circle"></i> Usuários</div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/admin/passenger')}  ><i className="fas fa-users"></i> Passageiros</div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/admin/crew')}  ><i className="fas fa-plane-departure"></i> Tripulacao</div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/admin/expense')}  ><i className="fas fa-coins"></i> Tipos de Despesas</div>
            </div>
            <div>
              <div onClick={this.redirect.bind(this, '/admin/parameter')}  ><i className="fas fa-cogs"></i> Parâmetros</div>
            </div>
            <div>
              <div onClick={() => { common.setUser(null); this.redirect('/login') }}  ><i className="fas fa-sign-out-alt"></i> Sair</div>
            </div>
          </div>
        </div>
        <div className="menu row no-gutters" >
          <div className="col-md-8 offset-md-2 row no-gutters">
            <div className="col" >
              <div onClick={this.redirect.bind(this, '/')}  ><i className="fas fa-futbol"></i><div>Consolidado</div></div>
            </div>
            <div className="col" >
              <div onClick={this.redirectLastLeg.bind(this)} ><i className="fas fa-money-check-alt"></i><div>Despesa</div></div>
            </div>
            <div className="col" >
              <div ><i className="fas fa-chart-bar"></i><div>Dashboard</div></div>
            </div>
            <div className="col" >
              <div onClick={this.showMore.bind(this)}  ><i className="fas fa-bars"></i><div>Mais</div></div>
            </div>
          </div>
        </div>

      </React.Fragment>
    );
  }
}

export default withRouter(Menu);
