import React, { Component } from 'react';
import * as common from '../Common';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import MomentLocaleUtils, { formatDate, parseDate } from 'react-day-picker/moment';
import 'moment/locale/pt-br';
import CurrencyFormat from 'react-currency-format';

class AdminBet extends Component {
  constructor(props) {
    super(props);

    this.barList();
    this.bindList();

    common.getData('combo/betlogin').then((data) => { this.setState({ betlogins: data }) })
    common.getData('combo/week').then((data) => { this.setState({ weeks: data }) })
    common.getData('combo/betstatus').then((data) => { this.setState({ betstatus: data }) })

    window.addEventListener('resize', this.setColumnWitdth);
  }
  componentWillUnmount(){
    window.removeEventListener('resize', this.setColumnWitdth);
  }
  state = {
    items: [],
    itemsAll: [],
    sortField: '',
    filter: '',
    data: { events: [] },
    multipliers: [],
    profits: [],
    commissions: [],
    bookmakers: [],
    betlogins: [],
    betstatus: [],
    weeks: [],
    date_from: this.getLastMonday(),
    date_to: new Date(this.getLastMonday()).addDays(6),
    event: {},
  }
  barList() {
    this.props.changeTitle({ left: null, center: 'Apostas', right:
    <div>
      <div className="block-inline mr-2" onClick={this.showFilter.bind(this)}><i className="fas fa-filter show-xs"></i></div>
      <div className="block-inline" onClick={this.newData.bind(this)} >{common.newButton()}</div> 
    </div> });
  }
  barForm = () => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={this.back.bind(this)}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div> });
  }
  bindList() {
    this.props.show();
    var that = this;
    let date_from = formatDate(this.state.date_from, "YYYY-MM-DD");
    let date_to = formatDate(this.state.date_to, "YYYY-MM-DD");
    common.getData(`bet/all-by-date/${date_from}/${date_to}`).then((data) => { that.props.hide(); this.setState({ items: data.slice(0, 99), itemsAll: data }) })
  }
  newData() {
    common.scrollTop();
    this.setState({ data: this.getNewData() });
    document.getElementById('new').className = 'form come';
    document.getElementById('list').className = 'hidden';
    document.getElementById('filter').className = 'hidden';

    this.barForm();
  }
  getNewData() {

    return {
      id: 0,
      data_betstatus: 0,
      events: [],
    }
  }
  back() {
    this.barList();
    document.getElementById('new').className = 'form go';
    document.getElementById('list').className = 'div-table-bets';
    document.getElementById('filter').className = 'filter hidden-xs';
    common.scrollLast();
  }
  editData(item) {
    this.props.show();
    common.getData('bet/' + item.id).then((data) => {
      this.props.hide();
      common.scrollTop();
      data.total_stake = common.formatNumber(data.total_stake);
      data.total_return = common.formatNumber(data.total_return);
  
      data.events.forEach(x => {
        x.event_date = formatDate(x.event_date, "DD/MM/YYYY");
        x.odds = common.formatNumber(x.odds);
        x.stake = common.formatNumber(x.stake);
      });
      this.setState({ data: data })
      document.getElementById('new').className = 'form come';
      document.getElementById('list').className = 'hidden';
      document.getElementById('filter').className = 'hidden';
      this.barForm();
    });


  }
  save() {
    let data = this.state.data;
    if (!data.login_original_id || data.login_original_id === "0") return alert("Selecione a Conta 365!");
    if (!data.bet_confirmation || data.bet_confirmation === "") return alert("Preencha a Aposta!");
    if (!data.placement_date || data.placement_date === "") return alert("Preencha a Data de Registro da Aposta!");
    if (!data.total_stake || data.bookmaker_id === "") return alert("Preencha o Stake da Aposta!");
    if (!data.total_return || data.total_return === "") return alert("Preencha o Return da Aposta!");
    if (data.events.length === 0) return alert("Adicione ao menos um evento!");

    if (!data.week_id) data.week_id = this.state.weeks[0].id;

    if (data.status_id == 6 && !window.confirm('Confirma a exclusão desta aposta?')) return;

    data.user_id = common.getUser().id;
    this.props.show();
    var that = this;
    common.postData('bet', this.state.data).then(function (data) {
      if (data.message) return alert(data.message);
      that.props.hide();
      that.bindList();
      that.back();
    });

  }

  handleChange = e => {
    let data = this.state.data;
    if (e.target.type === 'checkbox')
      data[e.target.name] = e.target.checked ? 6 : 0;
    else
      data[e.target.name] = e.target.value;

    this.setState({ data })

  }
  handleEventChange = e => {
    let event = this.state.event;
    event[e.target.name] = e.target.value;
    this.setState({ event })
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
      items = this.state.itemsAll.slice(0, 99);
    else {
      let value = e.target.value.toUpperCase();
      items = this.state.itemsAll.filter(x =>
        (x.login_name + "").toUpperCase().indexOf(value) >= 0 ||
        (x.bookmaker_name + "").toUpperCase().indexOf(value) >= 0 ||
        (x.bet_confirmation + "").toUpperCase().indexOf(value) >= 0 ||
        (x.created_user_name + "").toUpperCase().indexOf(value) >= 0
      ).slice(0, 99);
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
  handleEventChangeDate(selectedDay, modifiers, dayPickerInput) {
    let event = this.state.event;
    event.event_date = formatDate(selectedDay, "DD/MM/YYYY");
    this.setState({ event })
  }
  handleBetChangeDate(selectedDay, modifiers, dayPickerInput) {
    let data = this.state.data;
    data.placement_date = formatDate(selectedDay, "DD/MM/YYYY");
    this.setState({ data })
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

    document.querySelectorAll('.form-control-date .DayPickerInput input').forEach(x => {
      x.className = "form-control";
    });

  }
  setColumnWitdth() {
    let w = document.getElementById('th-bet').clientWidth;
    document.documentElement.style.setProperty('--table-bets-td-bet', `${w}px`);

    w = document.getElementById('th-event').clientWidth;
    document.documentElement.style.setProperty('--table-bets-td-event', `${w}px`);
  }
  divClick = (id) => {
    return;
    let div = document.getElementById(id);

    if (div.className.indexOf('no-break ') >= 0) {
      div.className = div.className.replace('no-break ', '');
      div.className = 'font-weight-bold ' + div.className;
    } else {
      div.className = div.className.replace('font-weight-bold ', '');
      div.className = 'no-break ' + div.className;
    }

  }
  addEvent = () => {

    if (!this.state.event.selection || this.state.event.selection === "") return alert('Preencha a Seleção!');
    if (!this.state.event.event_name || this.state.event.event_name === "") return alert('Preencha o Evento!');
    if (!this.state.event.stake || this.state.event.stake === "") return alert('Preencha o Stake!');
    if (!this.state.event.odds || this.state.event.odds === "") return alert('Preencha a Cotação!');
    if (!this.state.event.event_date) this.state.event.event_date = formatDate(new Date(), "DD/MM/YYYY");
    if (!this.state.event.result) this.state.event.result = "Ganhou";

    let data = this.state.data;
    data.events.push(this.state.event);
    this.setState({ event: {}, data });
  }
  eventDelete = (item, index) => {

    if (window.confirm('Confirma a exclusão do evento ' + item.event_name + '?')) {
      let data = this.state.data;
      data.events.splice(index, 1);
      this.setState({ data });
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
            <table className="table table-dark table-bordered table-striped table-sm table-bets table-scroll" >
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
                {this.state.items.map(x => <tr key={x.id} onClick={this.editData.bind(this, x)}  >
                  <td className="td-bet">{x.bet_confirmation.split('<br>').map((y, n) =>
                    <div title={y} id={'bet-' + x.id + '-' + n} onClick={this.divClick.bind(this, 'bet-' + x.id + '-' + n)} className="no-break font-sm overflow-x" key={n}>{y}</div>)}
                    <div><b>{x.login_name} - {x.bookmaker_name}</b></div>
                    {x.created_user_name != null ? <div><b className="text-danger">Criado:</b> {x.created_user_name} às {x.created_at}</div> : null}
                    {x.updated_user_name != null ? <div ><b className="text-warning">Atualizado:</b> {x.updated_user_name} às {x.updated_at}</div> : null}
                    {x.status_id == 6 ? <b className="label-deleted" >Excluída</b> : null}
                  </td>
                  <td className="top td-event">{x.event_names.split(',').map((y, n) => <div title={y} id={'event-' + x.id + '-' + n} onClick={this.divClick.bind(this, 'event-' + x.id + '-' + n)} className="no-break font-sm" key={n}>{y}</div>)}</td>
                  <td className="top">{x.event_dates.split(',').map((x, n) => <div className="no-break font-sm" key={n}>{formatDate(x, 'DD-MM-YY')}</div>)}</td>
                  <td className="top">{x.event_results.split(',').map((x, n) => <div className="font-sm" key={n}><span className={x.substring(0, 4) + '-Text'}>{x.replace("Ainda por Acontecer", "Aberto").replace('Reembolso(Push)', 'Reb(Push)')}</span></div>)}</td>
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
              <select className="form-control" name="login_original_id" value={this.state.data.login_original_id || "0"} onChange={this.handleChange} >
                <option value="0">Contas 365</option>
                {this.state.betlogins.map((x, i) => <option key={x.id} value={x.id} >{x.name}</option>)}
              </select>
            </div>
            <div className="col-sm-6">
              <div className="label">Semana</div>
              <select className="form-control" name="week_id" value={this.state.data.week_id || "0"} onChange={this.handleChange} >
                {this.state.weeks.map((x, i) => <option key={x.id} value={x.id} >{x.name}</option>)}
              </select>
            </div>
            <div className="col-sm-6">
              <div className="label">Aposta</div>
              <input type="text" placeholder="Aposta..." className="form-control" disabled={this.state.data.id != "0"} name="bet_confirmation" value={this.state.data.bet_confirmation || ""} onChange={this.handleChange}  ></input>
            </div>
            <div className="col-sm-6 form-control-date">
              <div className="label">Registro</div>
              {this.state.data.id != "0" ?
                <input type="text" className="form-control" disabled={true} name="placement_date" value={this.state.data.placement_date || ""}  ></input>
                :
                <DayPickerInput name="placement_date" dayPickerProps={{ selectedDay: this.state.data.placement_date }}
                  placeholder={formatDate(this.state.data.placement_date, 'DD/MM/YYYY')} onDayChange={this.handleBetChangeDate.bind(this)} parseDate={parseDate} formatDate={formatDate}
                  dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{ readOnly: true }} />
              }
            </div>
            <div className="col-sm-6">
              <div className="label">Stake</div>
              <CurrencyFormat type="tel" placeholder="Stake..." className="form-control" name="total_stake" value={this.state.data.total_stake || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange} />
            </div>
            <div className="col-sm-6">
              <div className="label">Return</div>
              <CurrencyFormat type="tel" placeholder="Return..." className="form-control" name="total_return" value={this.state.data.total_return || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange} />
            </div>
            <div className="col-sm-6">
              <div className="label">Status</div>
              <select className="form-control" name="data_betstatus" value={this.state.data.data_betstatus || "0"} onChange={this.handleChange} >
                {this.state.betstatus.map((x, i) => <option key={x.id} value={x.id} >{x.name}</option>)}
              </select>
            </div>
            <div className="col-sm-6">
              <div className="label">Excluída</div>
              <input type="checkbox" name="status_id" checked={this.state.data.status_id == 6 || ""} onChange={this.handleChange}  ></input>
            </div>
            <div className="col-sm-6">
            </div>
            <div className="col-12 mt-3">
              <h5>Eventos</h5>
            </div>
            {this.state.data.events.length == 0 ? null :
              <div className="col-12 mt-1 table-responsive">
                <table className="table table-dark table-bordered table-striped table-sm" >
                  <thead>
                    <tr>
                      <th>Seleção</th>
                      <th>Evento</th>
                      <th>Data</th>
                      <th>Stake</th>
                      <th>Odds</th>
                      <th className="text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.data.events.map((x, i) => <tr key={i} onClick={this.eventDelete.bind(this, x, i)} >
                      <td>{x.selection}</td>
                      <td>{x.event_name}</td>
                      <td>{x.event_date}</td>
                      <td>{x.stake}</td>
                      <td>{x.odds}</td>
                      <td className={x.result.substring(0, 4) + '-Text text-center'}>{x.result}</td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            }
            <div className="col-sm-6">
              <div className="label">Seleção</div>
              <input type="text" placeholder="Seleção..." className="form-control" name="selection" value={this.state.event.selection || ""} onChange={this.handleEventChange}  ></input>
            </div>
            <div className="col-sm-6">
              <div className="label">Evento</div>
              <input type="text" placeholder="Evento..." className="form-control" name="event_name" value={this.state.event.event_name || ""} onChange={this.handleEventChange}  ></input>
            </div>
            <div className="col-sm-6 form-control-date">
              <div className="label">Data</div>
              <DayPickerInput name="event_date" dayPickerProps={{ selectedDay: this.state.event.event_date }}
                placeholder={formatDate(new Date(), 'DD/MM/YYYY')} onDayChange={this.handleEventChangeDate.bind(this)} parseDate={parseDate} formatDate={formatDate}
                dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{ readOnly: true }} />
            </div>
            <div className="col-sm-6">
              <div className="label">Stake</div>
              <CurrencyFormat type="tel" placeholder="Stake..." className="form-control" name="stake" value={this.state.event.stake || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleEventChange} />
            </div>
            <div className="col-sm-6">
              <div className="label">Odds</div>
              <CurrencyFormat type="tel" placeholder="Odds..." className="form-control" name="odds" value={this.state.event.odds || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleEventChange} />
            </div>
            <div className="col-sm-6">
              <div className="label">Resultado</div>
              <select className="form-control" name="result" value={this.state.event.result || "Ganhou"} onChange={this.handleEventChange} >
                <option>Ganhou</option>
                <option>Perdeu</option>
                <option>Ainda por Acontecer</option>
              </select>
            </div>
            <div className="col-12 mt-2">
              <button className="btn btn-success" onClick={this.addEvent.bind(this)} >Adicionar Evento</button>
            </div>
          </div>
          <div className="text-right pt-2 col-12">
            <button className="btn btn-main" onClick={this.save.bind(this)} >Salvar</button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export default AdminBet;
