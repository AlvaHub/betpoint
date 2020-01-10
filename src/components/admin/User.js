import React, { Component } from 'react';
import * as common from '../Common';


class User extends Component {
  constructor(props) {
    super(props);

    this.barList();
    this.bindList();
    var that = this;
    common.getData('combo/permission').then((data) => { that.props.hide(); this.setState({ permissions: data }) });

  }
  state = {
    items: [],
    itemsAll: [],
    betLogins: [],
    betLoginsAll: [],
    sortField: '',
    filter: '',
    permissions: [],
    data: {},


  }
  barList() {
    this.props.changeTitle({ left: null, center: 'Usuários', right: <div onClick={this.newData.bind(this)} >{common.newButton()}</div> });
  }
  barForm = () => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={this.back.bind(this)}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div> });
  }
  bindList() {
    this.props.show();
    var that = this;
    common.getData('user').then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) })

  }
  bindLogins(id) {
    var that = this;
    common.getData('betlogin/by-user/' + id).then((data) => { that.props.hide(); this.setState({ betLogins: data, betLoginsAll: data }) })
  }
  newData() {
    common.scrollTop();
    this.setState({ data: this.getNewData(), showTableLogin: false });
    document.getElementById('new').className = 'form come';
    document.getElementById('list').className = 'hidden';
    document.getElementById('filter').className = 'hidden';

    this.barForm();
  }
  back() {
    this.barList();
    document.getElementById('new').className = 'form go';
    document.getElementById('list').className = 'table-responsive';
    document.getElementById('filter').className = 'filter';
    common.scrollLast();
  }
  editData(item) {
    this.props.show();
    common.getData('user/' + item.id).then((data) => {
      this.props.hide();
      common.scrollTop();
      data.active = data.active === '1';
      this.setState({ data: data, showTableLogin: data.permission_id == 3 })
      document.getElementById('new').className = 'form come';
      document.getElementById('list').className = 'hidden';
      document.getElementById('filter').className = 'hidden';
      this.barForm();

      //GetLogins
      this.bindLogins(data.id);
    });
  }
  save() {

    this.props.show();
    var that = this;
    common.postData('user', this.state.data).then((dataReturn) => {
      that.props.hide();
      that.bindList();
      let data = that.state.data;
      data.id = dataReturn.id;
      if (data.permission_id == 3) {
        that.setState({ showTableLogin: true, data });
        //GetLogins
        this.bindLogins(dataReturn.id);
      }
      else {
        that.back();
        that.setState({ data });
      }
    });

  }
  getNewData() {

    return {
      id: 0,
      active: 1,
      permission_id: 1
    }
  }
  handleChange = e => {
    let data = this.state.data;
    if (e.target.type === 'checkbox')
      data[e.target.name] = e.target.checked ? 1 : 0;
    else
      data[e.target.name] = e.target.value;

    this.setState({ data })

  }
  filter(e) {
    let items = [];
    if (e.target.value === '')
      items = this.state.itemsAll;
    else
      items = this.state.itemsAll.filter(x => x.name.toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0);
    this.setState({ items });
  }
  handleChangeLogin(login, e) {

    if (e.target.type === 'checkbox') {
      login[e.target.name] = e.target.checked ? 1 : 0;
      this.saveLogins(login, e);
    }
    else
      login[e.target.name] = e.target.value == '' ? null : e.target.value;

    this.setState(this.state.betLogins);

  }
  saveLogins(login, e) {
    let data = { user_id: this.state.data.id, login_id: login.login_id, linked: login.linked, profit_percent: login.profit_percent_custom };
    common.postData('user/save-logins', data).then((dataReturn) => {
    });
  }
  filterLogins() {
    if (this.state.showLoginsSelected) {
      let betLogins = this.state.betLoginsAll;
      this.setState({ showLoginsSelected: false, betLogins });
    }
    else {
      let betLogins = this.state.betLoginsAll.filter(x => x.linked == 1);
      this.setState({ showLoginsSelected: true, betLogins });
    }
  }
  render() {

    return (
      <React.Fragment>
        <div className="filter" id="filter" >
          <input type="text" className="form-control form-control-sm col-md-8 offset-md-2" placeholder="Buscar..." onChange={this.filter.bind(this)} />
        </div>
        <div className="div-table" ></div>
        <div id="list" className="table-responsive">
          <table className="table table-dark table-hover table-bordered table-striped table-sm" >
            <thead>
              <tr>
                <th onClick={common.tableSort.bind(this, 'first_name')} >Nome</th>
                <th onClick={common.tableSort.bind(this, 'email')} >Usuário</th>
                <th onClick={common.tableSort.bind(this, 'permission_id')} >Permissão</th>
                <th onClick={common.tableSort.bind(this, 'active')} >Ativo</th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map(x => <tr key={x.id} onClick={this.editData.bind(this, x)} >
                <td>{x.first_name}</td>
                <td>{x.email}</td>
                <td>{x.permission_name}</td>
                <td>{x.active === '1' ? 'Sim' : 'Não'}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div id="new" className="form row" >
          <div className="col-md-8 offset-md-2" >
            <div>
              <div className="label">Nome</div>
              <input type="text" placeholder="Nome..." className="form-control" name="first_name" value={this.state.data.first_name || ""} onChange={this.handleChange}  ></input>
            </div>
            <div>
              <div className="label">Usuário</div>
              <input type="text" placeholder="Usuário..." className="form-control" name="email" value={this.state.data.email || ""} onChange={this.handleChange}  ></input>
            </div>
            <div>
              <div className="label">Senha</div>
              <input type="text" placeholder="Senha..." className="form-control" name="password" value={this.state.data.password || ""} onChange={this.handleChange}  ></input>
            </div>
            <div>
              <div className="label">Permissão</div>
              <select className="form-control" name="permission_id" value={this.state.data.permission_id} onChange={this.handleChange} >
                {this.state.permissions.map((x, i) => <option key={x.id} value={x.id} >{x.name}</option>)}
              </select>
            </div>
            <div>
              <div className="label">Ativo</div>
              <input type="checkbox" placeholder="Senha..." name="active" checked={this.state.data.active || ""} onChange={this.handleChange}  ></input>
            </div>
            <div className="text-right pt-2">
              <button className="btn btn-main" onClick={this.save.bind(this)} >Salvar</button>
            </div>
            {this.state.showTableLogin && <React.Fragment>
              <div className="row mt-3" >
                <div className="col" >
                  <h5>Associar Logins</h5>
                </div>
                <div className="col-auto">
                  <button type="button" className="btn btn-sm btn-success" onClick={this.filterLogins.bind(this)}>{this.state.showLoginsSelected ? 'Mostrar Todos' : 'Filtrar Selecionados'}</button>
                </div>
              </div>

              <div id="list" className="table-responsive mt-1">
                <table className="table table-dark table-hover table-bordered table-striped table-sm text-center  table-user-login w-100" >
                  <thead>
                    <tr>
                      <th onClick={common.tableSort.bind(this, 'bookmaker_name')} >Cliente</th>
                      <th onClick={common.tableSort.bind(this, 'login_name')} >Login</th>
                      <th onClick={common.tableSort.bind(this, 'profit_percent')} >% Original</th>
                      <th>Ver</th>
                      <th>% Específico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.betLogins.map(x => <tr key={x.login_id}>
                      <td>{x.bookmaker_name}</td>
                      <td>{x.hide_report == 1 ? <span className="text-secondary">{x.login_name}</span> : x.login_name}</td>
                      <td>{x.profit_percent} ({(1 - x.profit_percent).toFixed(2)})</td>
                      <td><input type="checkbox" name="linked" checked={x.linked || ""} onChange={this.handleChangeLogin.bind(this, x)}></input></td>
                      <td><input type="text" disabled={!x.linked} name="profit_percent_custom" value={!x.linked ? '' : x.profit_percent_custom || ''} onChange={this.handleChangeLogin.bind(this, x)} onBlur={this.saveLogins.bind(this, x)}></input></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            </React.Fragment>}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default User;
