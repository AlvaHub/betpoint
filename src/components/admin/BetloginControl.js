import React, { Component } from 'react';
import * as common from '../Common';
import CurrencyFormat from 'react-currency-format';
import loadingImage from '../../images/loading-spinner.svg';
import { forkJoin } from 'rxjs';
import MyModal from '../MyModal';
class BetloginControl extends Component {
  constructor(props) {
    super(props);




  }
  componentDidMount() {
    this.barList();
    this.bindList();

    common.getData('combo/multiplier').then((data) => { this.setState({ multipliers: data, loaded: this.state.loaded + 1 }) })
    common.getData('combo/profit-percent').then((data) => { this.setState({ profits: data, loaded: this.state.loaded + 1 }) })
    common.getData('combo/commission-formula').then((data) => { this.setState({ commissions: data, loaded: this.state.loaded + 1 }) })
    common.getData('combo/bookmaker').then((data) => { this.setState({ bookmakers: data, loaded: this.state.loaded + 1 }) })
    let years = [];
    for (let index = new Date().getFullYear(); index < new Date().getFullYear() + 20; index++) {
      years.push(index);
    }
    let months = [];
    for (let index = 1; index < 13; index++) {
      months.push(index);
    }
    this.setState({ years, months });
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
    cards: [],
    cardTransactions: [],
    years: [],
    months: [],
    card: { id: 0, active: 1 },
    loaded: 0,
    loadingAll: false,
    stopAll: false,
    updateTotal: 0,
    updateCurrent: 0,
    balanceTypes: [
      { id: 1, name: 'Esportes' },
      { id: 3, name: 'Cassino' },
      { id: 4, name: 'Poker' },
      { id: 5, name: 'Vegas' },
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
    common.getData('balance/logins').then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) })
    common.getData('balance/cards').then((data) => {
      this.setState({ cards: data })
    })
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

    if (e.target.type === 'checkbox') {
      item.selected = e.target.checked;
    }
    else {
      item[e.target.name] = e.target.value;
    }
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
      x.loading = x.success = x.error = x.warning = x.processed = null;
    });
    let updateTotal = this.state.items.filter(x => x.selected && !x.processed).length;
    if (updateTotal === 0)
      return alert('Selecione as contas!');

    this.setState({ items: this.state.items, loadingAll: true, updateTotal, updateCurrent: 0 });
    this.updateAllAccountsAction();
  }
  updateAllAccountsAction = () => {

    if (this.state.stopAll) {
      this.setState({ stopAll: false, loadingAll: false });
      alert("Atualização Cancelada!")
      return;
    }
    let selectedItems = [];
    this.state.items.filter(x => x.selected && !x.processed).forEach(x => {
      if (selectedItems.length < 5) {
        x.processed = true;
        x.loading = true;
        let balance = x.initial_balance;
        selectedItems.push(fetch(common.api_balance_url + 'bet365_transfer.php?auto=1&login=' + x.login_name + '&pass=' + x.password_name + '&balance=' + balance).then(data => data.json()).catch(_ => { x.error = x.login_name + ": Erro Interno"; x.loading = null; }));
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
            if (x.success) {
              item.success = true;
              item.summary = x.summary;
              item.bank_balance = x.bank_balance;
              item.current_balance = x.current_balance;
              console.log(item);
              this.updateBalanceDB(item);
            }
            else if (x.error) {
              item.error = true;
              item.summary = x.summary;
            }
            else if (x.warning) {
              item.warning = true;
              item.summary = x.summary;
            }
          }
        });
        this.setState({ items: this.state.items, updateCurrent: this.state.updateCurrent + selectedItems.length });
        //CALL AGAIN
        setTimeout(this.updateAllAccountsAction, 500);
      })
    }
    else {
      this.setState({ loadingAll: false });
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

    let amount = parseFloat(data.balance.replace(/\./g, '').replace(',', '.'));
    if (!data.balance || amount < 1)
      return alert('Valor mínimo é de 1');

    let x = this.state.accountSelected;

    this.props.show();
    fetch(common.api_balance_url + 'bet365_transfer.php?login=' + x.login_name + '&pass=' + x.password_name + '&from=' + data.balanceOrigin + '&to=' + data.balanceDestiny + '&amount=' + amount)
      .then(data => data.json())
      .catch(_ => { this.props.hide(); alert('Erro Interno'); })
      .then(data => {
        this.props.hide();
        x.bank_balance = data.bank_balance;
        x.current_balance = data.current_balance;
        this.setState({ items: this.state.items });
        this.updateBalanceDB(x);
        alert(data.summary);
      });
  }
  updateBalanceDB(item) {
    common.postData('betlogin/update-balance', item).then();
  }
  selectAccount = (x) => {
    if (x == this.state.accountSelected)
      this.setState({ accountSelected: null });
    else
      this.setState({ accountSelected: x });

  }
  openCardWindow = () => {
    let card = this.state.cards.find(x => x.active == 1);
    card = card ? card : { id: 0, active: 1 };
    this.setState({ showModal: true, cardMessageError: null, cardMessageSuccess: null, card, card_selected: card.id });
    common.getData('balance/transactions/' + card.id).then(data => {
      this.setState({ cardTransactions: data, cardTransactionTotal: data.length > 0 && data.map(x => x.amount).reduce((x, i) => x + i) });
    });

  }
  cardSave = () => {

    let card = this.state.card;
    if (this.state.cards.filter(x => x.active == 1 && x.id != card.id && card.active == 1).length > 0)
      return this.setState({ cardMessageError: 'Só é possível ter um cartão ativo!' });


    let error = false;
    for (let prop of ['card_number', 'expire_year', 'expire_month']) {
      if (!error && (!card[prop] || card[prop].trim() == '')) {
        this.setState({ cardMessageError: 'Preencha Todos os Campos' });
        error = true;
      }
    }
    if (error) return;

    common.postData('balance/card', card).then(data => {
      let cards = this.state.cards;
      if (card.id == 0)
        this.state.cards.push(data);
      else
        cards[cards.findIndex(x => x.id == card.id)] = { ...card };

      this.setState({ cards: cards, card_selected: data.id, cardMessageSuccess: 'Dados Salvos com sucesso' });
    }, error => { this.setState({ cardMessageError: 'Erro ao salvar. ' + error }); });
  }
  cardEdit = (e) => {
    let card = e.target.value == 0 ? { id: 0, active: 1 } : { ...this.state.cards.find(x => x.id == e.target.value) };
    this.setState({ card, card_selected: e.target.value, cardMessageError: null, cardMessageSuccess: null, cardTransactions: [] });
    common.getData('balance/transactions/' + card.id).then(data => {
      this.setState({ cardTransactions: data, cardTransactionTotal: data.length > 0 && data.map(x => x.amount).reduce((x, i) => x + i) });
    });

  }
  cardCancel = () => {

    this.setState({ card: null, card_selected: null })
  }
  handleChangeCard = (e) => {

    let card = this.state.card;
    if (e.target.type === 'checkbox') {
      card[e.target.name] = e.target.checked ? 1 : 0;
    }
    else {
      card[e.target.name] = e.target.value;
    }
    this.setState({ card });
  }
  render() {

    return (
      <React.Fragment>
        <MyModal handleShow={this.state.showModal} handleClose={() => { this.setState({ showModal: false }) }} title="Cartões" >
          <div className="row gutters" >
            <div className="col-12 flex" >
              <div>
                <select className="form-control mr-2" name="card_selected" value={this.state.card_selected || "0"} onChange={this.cardEdit} >
                  <option value="0">Novo Cartão</option>
                  {this.state.cards.map((x, i) => <option key={x.id} value={x.id} >{x.card_number} {x.active == 1 ? '- Ativo' : ''}</option>)}
                </select>
              </div>
            </div>
            <div className="col-6">
              <input type="text" className="form-control" name="card_number" placeholder="Número" onChange={this.handleChangeCard} value={this.state.card.card_number || ''} />
            </div>
            <div className="col-3">
              <select className="form-control mr-2" name="expire_year" value={this.state.card.expire_year || "0"} onChange={this.handleChangeCard} >
                <option value="0">Ano</option>
                {this.state.years.map((x, i) => <option key={x} value={x} >{x}</option>)}
              </select>
            </div>
            <div className="col-3">
              <select className="form-control mr-2" name="expire_month" value={this.state.card.expire_month || "0"} onChange={this.handleChangeCard} >
                <option value="0">Mês</option>
                {this.state.months.map((x, i) => <option key={x} value={x} >{x}</option>)}
              </select>
            </div>
            <div className="col-6">
              <input type="text" className="form-control" name="cvv" placeholder="cvv" onChange={this.handleChangeCard} value={this.state.card.cvv || ''} />
            </div>
            <div className="col-6">
              <input type="checkbox" name="active" checked={this.state.card.active == 1 || ""} onChange={this.handleChangeCard} />
            </div>
            <div className="col-12 text-right" >
              <button className="btn btn-primary" onClick={this.cardSave} >{this.state.card.id != 0 ? 'Atualizar' : 'Adicionar'}</button>
            </div>
            {this.state.cardMessageSuccess && <div className="col-12 mt-2 text-center message-success font-weight-bold" >
              {this.state.cardMessageSuccess}
            </div>}
            {this.state.cardMessageError && <div className="col-12 mt-2 text-center message-danger font-weight-bold" >
              {this.state.cardMessageError}
            </div>}
            <div className="col-12" >
              <b>Histórico de transações. Total Utilizado: <span className="text-primary">{this.state.cardTransactionTotal || 0}</span> </b>
              <table className="table-dark table-striped table-sm w-100 mt-2">
                <thead>
                  <tr>
                    <th>Login</th>
                    <th>Valor</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.cardTransactions.map(x =>
                    <tr key={x.id} >
                      <td>{x.login_name}</td>
                      <td>{x.amount}</td>
                      <td>{x.created_at}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </MyModal>
        <div className="filter padding-sm row m-0" id="filter" hidden={!this.state.loadingAll} >
          <div className="col-md-12 text-right text-secondary" >
            Atualizado: {this.state.updateCurrent} de {this.state.updateTotal}
            <button className="btn btn-sm btn-danger ml-2" onClick={() => { this.setState({ stopAll: true }) }} hidden={this.state.stopAll} >Parar</button>
            <button className="btn btn-sm btn-danger ml-2" disabled hidden={!this.state.stopAll} >Serviço Cancelado</button>
          </div>
        </div>
        <div className="filter padding-sm row m-0" id="filter" hidden={this.state.loadingAll} >
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
          <div className="col-md-4 flex" >
            <div>
              <button className="btn btn-sm btn-success" onClick={this.updateOneAccount.bind(this)} >{this.state.accountSelected ? this.state.accountSelected.login_name : 'Transferir'}</button>
            </div>
            <div>
              <button className="btn btn-sm btn-light" onClick={this.openCardWindow.bind(this)} ><i className="fas fa-credit-card"></i></button>
            </div>

            <div className="text-center" >
              <button className="btn btn-sm btn-primary" onClick={() => { window.open(common.api_balance_url + 'bet365_transfer.txt?' + new Date().getTime()) }} >Ver Log</button>
            </div>
            <div className="text-right" >
              <button className="btn btn-sm btn-secondary" onClick={this.updateAllAccounts.bind(this)} >Atualizar Sel.</button>
            </div>
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
                <td onClick={e => { e.stopPropagation(); }} >
                  <CurrencyFormat type="tel" name="initial_balance" className="initial-balance" value={x.initial_balance} onChange={this.handleChangeItem.bind(this, x)} ></CurrencyFormat>
                </td>
                <td>{x.current_balance}</td>
                <td>{x.bank_balance}</td>
                <td onClick={e => { e.stopPropagation(); }}><input type="checkbox" className="normal" name="selected" checked={x.selected || ""} onChange={this.handleChangeItem.bind(this, x)} ></input></td>
                <td>
                  {x.loading && <img src={loadingImage} style={{ width: '25px' }} />}
                  {x.success && <i className="fas fa-check-circle text-info" title={x.summary} />}
                  {x.error && <i className="fas fa-times-circle text-danger" title={x.summary} />}
                  {x.warning && <i className="fas fa-exclamation-triangle text-warning" title={x.summary} />}
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="page-margin-bottom" ></div>
      </React.Fragment >
    );
  }
}

export default BetloginControl;
