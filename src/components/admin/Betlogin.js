import React, { Component } from 'react';
import * as common from '../Common';


class Betlogin extends Component {
  constructor(props) {
    super(props);

    this.barList();
    this.bindList();

    common.getData('combo/multiplier').then((data) => { this.setState({ multipliers: data }) })
    common.getData('combo/profit-percent').then((data) => { this.setState({ profits: data }) })
    common.getData('combo/commission-formula').then((data) => { this.setState({ commissions: data }) })
    common.getData('combo/bookmaker').then((data) => { this.setState({ bookmakers: data }) })

  }
  state = {
    items: [],
    itemsAll: [],
    sortField: '',
    filter: '',
    permissions: [],
    data: {},
    multipliers: [],
    profits: [],
    commissions: [],
    bookmakers: []

  }
  barList() {
    this.props.changeTitle({ left: null, center: 'Contas Bet 365', right: <div onClick={this.newData.bind(this)} >{common.newButton()}</div> });
  }
  barForm = () => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={this.back.bind(this)}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div> });
  }
  bindList() {
    this.props.show();
    var that = this;
    common.getData('betlogin').then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) })
  }
  newData() {
    common.scrollTop();
    this.setState({ data: this.getNewData() });
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
    common.getData('betlogin/' + item.id).then((data) => {
      this.props.hide();
      common.scrollTop();
      data.active = data.active === '1';
      data.hide_report = data.hide_report === '1';
      this.setState({ data: data })
      document.getElementById('new').className = 'form come';
      document.getElementById('list').className = 'hidden';
      document.getElementById('filter').className = 'hidden';
      this.barForm();
    });
  }
  save() {
    let data = this.state.data;

    if (!data.login_name || data.login_name === "") return alert("Preencha o Login!");
    if (!data.password_name || data.password_name === "") return alert("Preencha a Senha!");
    if (!data.bookmaker_id || data.bookmaker_id == 0) return alert("Selecione o Cliente!");


    this.props.show();
    var that = this;
    common.postData('betlogin', this.state.data).then(function (data) {
      that.props.hide();
      that.bindList();
      that.back();
    });

  }
  getNewData() {

    return {
      id: 0,
      active: 1,
      multiplier_id: this.state.multipliers[0].id,
      profit_percent_id: this.state.profits[0].id,
      bookmaker_id: this.state.bookmakers[0].id,
      commission_formula_id: this.state.commissions[0].id
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
    else {
      let value = e.target.value.toLowerCase();
      items = this.state.itemsAll.filter(x => x.login_name.toLowerCase().indexOf(value) >= 0 || (x.bookmaker_name + "").toLowerCase().indexOf(value) >= 0);
    }
    this.setState({ items });
  }
  updateOrder = () => {
    this.props.show();
    var that = this;
    common.postData('betlogin/update-order', this.state.data.login_order).then(function (data) {
      that.props.hide();
      if (data == 1) alert('Ordem atualizada com sucesso!')
    });
  }
  render() {

    return (
      <React.Fragment>
        <div className="filter" id="filter" >
          <input type="text" className="form-control form-control-sm col-md-8 offset-md-2" placeholder="Buscar..." onChange={this.filter.bind(this)} />
        </div>
        <div className="div-table" ></div>
        <div id="list" className="table-responsive">
        
          <table className="table table-dark table-hover table-bordered table-striped table-sm text-center w-100" >
            <thead>
              <tr>
                <th onClick={common.tableSort.bind(this, 'dat_loaded')} >Atualização</th>
                <th onClick={common.tableSort.bind(this, 'login_name')} >Login</th>
                <th onClick={common.tableSort.bind(this, 'password_name')} >Senha</th>
                <th onClick={common.tableSort.bind(this, 'bookmaker_name')} >Cliente</th>
                <th onClick={common.tableSortNumber.bind(this, 'initial_balance')} >Inicial</th>
                <th onClick={common.tableSortNumber.bind(this, 'current_balance')} >Atual</th>
                <th onClick={common.tableSortNumber.bind(this, 'bank_balance')} > Banco</th>
                <th onClick={common.tableSort.bind(this, 'active')} className="td-min" >Ativo</th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map(x => <tr key={x.id} onClick={this.editData.bind(this, x)} >
                <td>{x.dat_loaded}</td>
                <td>{x.hide_report == 1 ?  <span className="text-secondary">{x.login_name}</span> : x.login_name }</td>
                <td>{x.password_name}</td>
                <td>{x.bookmaker_name}</td>
                <td>{x.initial_balance}</td>
                <td>{x.current_balance}</td>
                <td>{x.bank_balance}</td>
                <td className="td-min">{x.active === '1' ? 'Sim' : 'Não'}</td>
              </tr>)}
            </tbody>
          </table>
          <div className="row no-gutters mb-1 mt-2 p-1">
            <textarea name="login_order" className="form-control col-md-3 mr-1" rows="1" onChange={this.handleChange} ></textarea>
            <div className="col-md-2">
              <button type="button" className="btn btn-success" onClick={this.updateOrder} >Atualizar Ordem</button>
            </div>
          </div>
        </div>
        <div id="new" className="form" >
          <div className="row m-0 p-0" >
            <div className="col-sm-6">
              <div className="label">Login</div>
              <input type="text" placeholder="Login..." className="form-control" name="login_name" value={this.state.data.login_name || ""} onChange={this.handleChange}  ></input>
            </div>
            <div className="col-sm-6">
              <div className="label">Senha</div>
              <input type="text" placeholder="Senha..." autoComplete="on" className="form-control" name="password_name" value={this.state.data.password_name || ""} onChange={this.handleChange}  ></input>
            </div>
            <div className="col-sm-6">
              <div className="label">Cliente</div>
              <select className="form-control" name="bookmaker_id" value={this.state.data.bookmaker_id || "0"} onChange={this.handleChange} >
              <option value="0">Clientes</option>
                {this.state.bookmakers.map((x, i) => <option key={x.id} value={x.id} >{x.name}</option>)}
              </select>
            </div>
            <div className="col-sm-6">
              <div className="label">Comissão</div>
              <select className="form-control" name="commission_formula_id" value={this.state.data.commission_formula_id || ""} onChange={this.handleChange} >
                {this.state.commissions.map((x, i) => <option key={x.id} value={x.id} >{x.name}</option>)}
              </select>
            </div>
            <div className="col-sm-6">
              <div className="label">Multiplicador</div>
              <select className="form-control" name="multiplier_id" value={this.state.data.multiplier_id || ""} onChange={this.handleChange} >
                {this.state.multipliers.map((x, i) => <option key={x.id} value={x.id} >{x.equation}</option>)}
              </select>
            </div>
            <div className="col-sm-6">
              <div className="label">Percentual</div>
              <select className="form-control" name="profit_percent_id" value={this.state.data.profit_percent_id || ""} onChange={this.handleChange} >
                {this.state.profits.map((x, i) => <option key={x.id} value={x.id} >{x.equation}</option>)}
              </select>
            </div>
            <div className="col-sm-6">
              <div className="label">Saldo Inicial</div>
              <input type="text" placeholder="Saldo Inicial..." className="form-control" name="initial_balance" value={this.state.data.initial_balance || ""} onChange={this.handleChange}  ></input>
            </div>
            <div className="col-sm-6">
              <div className="label">Saldo Atual</div>
              <input type="text" placeholder="Saldo Atual..." className="form-control" name="current_balance" value={this.state.data.current_balance || ""} onChange={this.handleChange}  ></input>
            </div>
            <div className="col-sm-6">
              <div className="label">Saldo Banco</div>
              <input type="text" placeholder="Saldo Banco..." className="form-control" name="bank_balance" value={this.state.data.bank_balance || ""} onChange={this.handleChange}  ></input>
            </div>

            <div className="col-sm-6">
              <div className="label">Mensagem Alerta</div>
              <input type="text" placeholder="Mensagem Alerta..." className="form-control" name="message_alert_id" value={this.state.data.message_alert_id || ""} onChange={this.handleChange}  ></input>
            </div>
            <div className="col-sm-6">
              <div className="label">Ativo</div>
              <input type="checkbox"  name="active" checked={this.state.data.active || ""} onChange={this.handleChange}  ></input>
            </div>
            <div className="col-sm-6">
              <div className="label">Ocultar no Consolidado</div>
              <input type="checkbox" name="hide_report" checked={this.state.data.hide_report || ""} onChange={this.handleChange}  ></input>
            </div>
            <div className="text-right pt-2 col-12">
              <button className="btn btn-main" onClick={this.save.bind(this)} >Salvar</button>
            </div>
          </div>
        </div>
 
        <div className="page-margin-bottom" ></div>
      </React.Fragment>
    );
  }
}

export default Betlogin;
