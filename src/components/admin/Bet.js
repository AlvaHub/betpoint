import React, { Component } from 'react';
import * as common from '../Common';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import MomentLocaleUtils, { formatDate, parseDate } from 'react-day-picker/moment';
import 'moment/locale/pt-br';

class AdminBet extends Component {
  constructor(props) {
    super(props);

    this.barList();
    this.bindList();

    common.getData('combo/multiplier').then((data) => { this.setState({ multipliers: data }) })
    common.getData('combo/profit-percent').then((data) => { this.setState({ profits: data }) })
    common.getData('combo/commission-formula').then((data) => { this.setState({ commissions: data }) })
    common.getData('combo/bookmaker').then((data) => { this.setState({ bookmakers: data }) })

    window.addEventListener('resize', () => {
      this.setColumnWitdth();
    });

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
    date_from: this.getLastMonday(),
    date_to: new Date(this.getLastMonday()).addDays(6)

  }
  barList() {
    this.props.changeTitle({ left: null, center: 'Apostas', right: <div onClick={this.newData.bind(this)} >{common.newButton()}</div> });
  }
  barForm = () => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={this.back.bind(this)}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div> });
  }
  bindList() {
    this.props.show();
    var that = this;
    let date_from = formatDate(this.state.date_from, "YYYY-MM-DD");
    let date_to = formatDate(this.state.date_to, "YYYY-MM-DD");
    common.getData(`bet/all-by-date/${date_from}/${date_to}`).then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) })
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
  showFilter() {
    var css = document.getElementById('filter').className;
    css = css.indexOf('hidden-xs') > 0 ? 'filter' : 'filter hidden-xs';
    document.getElementById('filter').className = css;
  }
  hideFilter() {
    document.getElementById('filter').className = 'filter hidden-xs';
  }
  filter(e) {
    let items = [];
    if (e.target.value == '')
      items = this.state.itemsAll;
    else {
      let value = e.target.value.toUpperCase();
      items = this.state.itemsAll.filter(x =>
        (x.conta + "").toUpperCase().indexOf(value) >= 0 || (x.cliente + "").toUpperCase().indexOf(value) >= 0);
    }

    this.setState({ items });
  }
  getLastMonday() {
    var index = 0;
    var date_from = null;
    while (true || index < 7) {
      date_from = new Date().addDays(index)
      if (formatDate(date_from, "dddd") === "Monday")
        break;
      index--;
    }
    return date_from;
  }
  handleDayChange(selectedDay, modifiers, dayPickerInput) {
    this.setState({ [dayPickerInput.props.name]: selectedDay })

    setTimeout(() => {
      this.bindList();
    }, 1);

  }
  changeWeek = (signal) => {
    let date_from = this.state.date_from.addDays(7 * signal);
    let date_to = this.state.date_to.addDays(7 * signal);
    this.setState({ date_from, date_to });

    setTimeout(() => {
      this.bindList();
    }, 1);
    setTimeout(() => { this.hideFilter() }, 1000);
  }
  componentDidUpdate() {
    this.setColumnWitdth();
  }
  setColumnWitdth() {
    let w = document.getElementById('th-bet').clientWidth;
    document.documentElement.style.setProperty('--table-bets-td-bet', `${w}px`);

    w = document.getElementById('th-event').clientWidth;
    document.documentElement.style.setProperty('--table-bets-td-event', `${w}px`);
  }
  divClick = (id) => {

    let div = document.getElementById(id);

    if (div.className.indexOf('no-break ') >= 0) {
      div.className = div.className.replace('no-break ', '');
      div.className = 'font-weight-bold ' + div.className;
    } else {
      div.className = div.className.replace('font-weight-bold ', '');
      div.className = 'no-break ' + div.className;
    }

  }
  render() {

    return (
      <React.Fragment>
       <div className="filter hidden-xs" id="filter">
          <div className="row no-gutters" >
            <div className="col-12 col-sm-4 p-1">
              <input type="text" className="form-control form-control-sm" placeholder="Buscar..." onChange={this.filter.bind(this)} />
            </div>
            <div className="col-6 col-sm-3 p-1">
              <DayPickerInput name="date_from" dayPickerProps={{ selectedDay: this.state.date_from }}
                placeholder={formatDate(this.state.date_from, 'DD/MM/YYYY')} onDayChange={this.handleDayChange.bind(this)} parseDate={parseDate} formatDate={formatDate}
                dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{ readOnly: true }} />
            </div>
            <div className="col-6 col-sm-3 p-1 date-to">
              <DayPickerInput name="date_to"
                placeholder={formatDate(this.state.date_to, 'DD/MM/YYYY')} onDayChange={this.handleDayChange.bind(this)} parseDate={parseDate} formatDate={formatDate}
                dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{ readOnly: true }} />
            </div>
            <div className="col-12 col-sm-2 p-1 align-self-center text-center">
              <i className="fas fa-arrow-left mr-4 text-secondary font-icon pointer" onClick={this.changeWeek.bind(this, -1)} ></i>
              <i className="fas fa-arrow-right  text-secondary font-icon pointer" onClick={this.changeWeek.bind(this, 1)} ></i>
            </div>
          </div>
        </div>
        <div className="margin-top-filter margin-top-filter-xs" ></div>
        <div id="list" className="div-table-bets">
          <table className="table table-dark table-bordered table-striped table-sm table-bets table-scroll hidden-xs" >
            <thead>
              <tr>
                <th id="th-bet" >Bet Details</th>
                <th id="th-event">Event</th>
                <th>Data</th>
                <th>Status</th>
                <th onClick={common.tableSort.bind(this, 'placement_date')} >Registro</th>
                <th onClick={common.tableSort.bind(this, 'total_return')} >Return</th>
                <th onClick={common.tableSort.bind(this, 'total')} >Total</th>
                <th onClick={common.tableSort.bind(this, 'odds')} >Odds</th>
                <th onClick={common.tableSort.bind(this, 'data_betstatus')} >Enc</th>
                <th onClick={common.tableSort.bind(this, 'comissao')} >Com</th>

              </tr>
            </thead>
            <tbody>
              {this.state.items.map(x => <tr key={x.id}  >
                <td className="td-bet">{x.bet_confirmation.split('<br>').map((y, n) => <div title={y} id={'bet-' + x.id + '-' + n} onClick={this.divClick.bind(this, 'bet-' + x.id + '-' + n)} className="no-break font-sm overflow-x" key={n}>{y}</div>)}</td>
                <td className="top td-event">{x.event_names.split(',').map((y, n) => <div title={y} id={'event-' + x.id + '-' + n} onClick={this.divClick.bind(this, 'event-' + x.id + '-' + n)} className="no-break font-sm" key={n}>{y}</div>)}</td>
                <td className="top">{x.event_dates.split(',').map((x, n) => <div className="no-break font-sm" key={n}>{formatDate(x, 'DD-MM-YY')}</div>)}</td>
                <td className="top">{x.event_results.split(',').map((x, n) => <div className="font-sm" key={n}><span className={x.substring(0, 4) + '-Text'}>{x.replace("Ainda por Acontecer", "Aberto").replace('Reembolso(Push)','Reb(Push)')}</span></div>)}</td>
                <td>{formatDate(x.placement_date, 'DD-MM-YY hh:mm:ss')}</td>
                <td className="font-sm">{x.total_return}</td>
                <td className={x.total < 0 ? 'red' : 'green'}>{x.total}</td>
                <td>{x.odds}</td>
                <td className="text-center">{x.data_betstatus}</td>
                <td>{x.comissao}</td>
              </tr>)}
            </tbody>
          </table>
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
              <input type="checkbox" name="active" checked={this.state.data.active || ""} onChange={this.handleChange}  ></input>
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
      </React.Fragment>
    );
  }
}
export default AdminBet;
