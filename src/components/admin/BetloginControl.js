import React, { Component } from 'react';
import * as common from '../Common';
import CurrencyFormat from 'react-currency-format';
import loadingImage from '../../images/loading-spinner.svg';
import { forkJoin } from 'rxjs';

class BetloginControl extends Component {
  constructor(props) {
    super(props);

    this.barList();
    this.bindList();

    common.getData('combo/multiplier').then((data) => { this.setState({ multipliers: data, loaded: this.state.loaded + 1 }) })
    common.getData('combo/profit-percent').then((data) => { this.setState({ profits: data, loaded: this.state.loaded + 1 }) })
    common.getData('combo/commission-formula').then((data) => { this.setState({ commissions: data, loaded: this.state.loaded + 1 }) })
    common.getData('combo/bookmaker').then((data) => { this.setState({ bookmakers: data, loaded: this.state.loaded + 1 }) })

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
    bookmakers: [],
    loaded: 0,
    balanceTypes: [
      { id: 1, name: 'Esportes' },
      { id: 3, name: 'Cassino' },
      // { id: 4, name: 'Poker' },
      // { id: 5, name: 'Vegas' },
    ]

  }
  barList() {
    this.props.changeTitle({ left: null, center: 'Contas Bet 365' });
  }
  barForm = () => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={this.back.bind(this)}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div> });
  }
  bindList() {
    this.props.show();
    var that = this;
    common.getData('betlogin').then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) })
  }
  back() {
    this.barList();
    document.getElementById('new').className = 'form go';
    document.getElementById('list').className = 'table-responsive';
    document.getElementById('filter').className = 'filter';
    common.scrollLast();
  }
  handleChange = e => {
    let data = this.state.data;
    if (e.target.type === 'checkbox') {
      data[e.target.name] = e.target.checked ? 1 : 0;
      let items = this.state.items;
      items.forEach(x => x.selected = e.target.checked);
      this.setState({ data, items });
    }
    else {
      data[e.target.name] = e.target.value;
      this.setState({ data });
    }

  }
  handleChangeItem = (item, e) => {

    item.selected = e.target.checked;
    this.setState({ items: this.state.items });

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
  updateAllAccounts = () => {

    this.state.items.forEach(x => {
      x.loading = x.success = x.error = x.processed = null;
    });
    this.setState({ items: this.state.items });
    this.updateAllAccountsAction();
  }
  updateAllAccountsAction = () => {

    let selectedItems = [];
    let api_url = 'http://api.betpoint:8001/bet365_transfer.php?';
    this.state.items.filter(x => x.selected && !x.processed).forEach(x => {
      if (selectedItems.length < 3) {
        x.processed = true;
        x.loading = true;
        selectedItems.push(fetch(api_url + 'login=' + x.login_name + '&pass=' + x.password_name).then(data => data.json()).catch(_ => { x.error = x.login_name + ": Erro Interno"; x.loading = null; }));
      }
    });
    this.setState({ items: this.state.items });
    if (selectedItems.length > 0) {
      let fork = forkJoin(selectedItems);
      fork.subscribe(data => {

        data.forEach(x => {
          if (x) {
            let item = this.state.items.find(y => y.login_name == x.login);
            item.loading = false;
            if (x.success)
              item.success = x.success;
            else if (x.error) {
              item.error = true;
              item.errorMessage = x.error;
            }
          }
        });
        this.setState({ items: this.state.items });
        //CALL AGAIN
        setTimeout(this.updateAllAccountsAction, 500);
      })
    }
    else {
      alert("Atualização de Saldos Concluída!")
    }

  }
  updateOneAccount = () => {

    let data = this.state.data;
    if (!this.state.accountSelected)
      return alert('Selecione o login!');
    if (!data.balanceOrigin || data.balanceOrigin == '0' || !data.balanceDestiny || data.balanceDestiny == '0')
      return alert('Selecione o banco de Origem e Destino!');
    if (data.balanceOrigin == data.balanceDestiny)
      return alert('Origem e Destino devem ser diferentes!');

    let balance = parseFloat(data.balance.replace(/\./g, '').replace(',', '.'));
    console.log(balance);
    if (!data.balance || balance < 1)
      return alert('Valor mínimo é de 1');

    //this.props.show();
    // common.postData('betlogin/update-order', this.state.data.login_order).then(function (data) {
    //   that.props.hide();
    //   if (data == 1) alert('Ordem atualizada com sucesso!')
    // });
  }
  selectAccount = (x) => {
    if (x == this.state.accountSelected)
      this.setState({ accountSelected: null });
    else
      this.setState({ accountSelected: x });

  }
  render() {

    return (
      <React.Fragment>
        <div className="filter row m-0" id="filter" >
          <div className="col-md-2" >
            <input type="text" className="form-control form-control-sm" placeholder="Buscar..." onChange={this.filter.bind(this)} />
          </div>
          <div className="col-md-2" >
            <select className="form-control form-control-sm" name="balanceOrigin" onChange={this.handleChange.bind(this)} >
              <option value="0" >Origem</option>
              {this.state.balanceTypes.map(x =>
                <option key={x.id} value={x.id} >{x.name}</option>
              )}
            </select>
          </div>
          <div className="col-md-2" >
            <select className="form-control form-control-sm" name="balanceDestiny" onChange={this.handleChange.bind(this)} >
              <option value="0" >Destino</option>
              {this.state.balanceTypes.map(x =>
                <option key={x.id} value={x.id} >{x.name}</option>
              )}
            </select>
          </div>
          <div className="col-md-2" >
            <CurrencyFormat type="tel" placeholder="Valor" className="form-control form-control-sm" name="balance" value={this.state.data.balance || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange} />
          </div>
          <div className="col-md-2" >
            <button className="btn btn-sm btn-success" onClick={this.updateOneAccount.bind(this)} >{this.state.accountSelected ? this.state.accountSelected.login_name : 'Atualizar uma conta'}</button>
          </div>
          <div className="col text-right" >
            <button className="btn btn-sm btn-secondary" onClick={this.updateAllAccounts.bind(this)} >Atualizar Todas</button>
          </div>
        </div>
        <div className="div-table" ></div>
        <div id="list" className="table-responsive">

          <table className="table table-dark table-hover table-bordered table-striped table-sm text-center w-100" >
            <thead>
              <tr className="v-middle" >
                <th onClick={common.tableSort.bind(this, 'bookmaker_name')} >Cliente</th>
                <th onClick={common.tableSort.bind(this, 'login_name')} >Login</th>
                <th onClick={common.tableSort.bind(this, 'password_name')} >Senha</th>
                <th onClick={common.tableSort.bind(this, 'initial_balance')} >Saldo Inicial</th>
                <th onClick={common.tableSort.bind(this, 'current_balance')} >Saldo Atual</th>
                <th onClick={common.tableSort.bind(this, 'bank_balance')} >Saldo Banco</th>
                <th><input type="checkbox" name="chkAll" className="normal" onChange={this.handleChange} ></input></th>
                <th>Status</th>

              </tr>
            </thead>
            <tbody>
              {this.state.items.map(x => <tr key={x.id} className={this.state.accountSelected == x ? 'v-middle selected' : 'v-middle'} onClick={this.selectAccount.bind(this, x)}>
                <td>{x.bookmaker_name}</td>
                <td>{x.hide_report == 1 ? <span className="text-secondary">{x.login_name}</span> : x.login_name}</td>
                <td>{x.password_name}</td>
                <td>{x.initial_balance}</td>
                <td>{x.current_balance}</td>
                <td>{x.bank_balance}</td>
                <td onClick={e => { e.stopPropagation(); }}><input type="checkbox" className="normal" name="selected" checked={x.selected || ""} onChange={this.handleChangeItem.bind(this, x)} ></input></td>
                <td>
                  {x.loading && <img src={loadingImage} style={{ width: '25px' }} />}
                  {x.success && <i className="fas fa-check-circle text-info" title={x.success} />}
                  {x.error && <i className="fas fa-times-circle text-danger" title={x.error} />}
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="page-margin-bottom" ></div>
      </React.Fragment>
    );
  }
}

export default BetloginControl;
