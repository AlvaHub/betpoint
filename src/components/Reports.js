import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';
import 'react-day-picker/lib/style.css';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import MomentLocaleUtils, { formatDate, parseDate } from 'react-day-picker/moment';
import 'moment/locale/pt-br';

class Reports extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.barList();
  }
  barList() {
    this.props.changeTitle({ left: null, center: <div className="pointer" onClick={this.bindList.bind(this)} >Indicadores</div>, right: <div className="" onClick={this.showFilter.bind(this)}><i className="fas fa-filter show-xs"></i></div> });
  }
  barForm = (title) => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={() => this.back()}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div>, center: title });
  }
  back() {
    this.barList();
    document.getElementById('detail').className = 'form go';
    document.getElementById('list').className = '';
    document.getElementById('filter').className = 'filter hidden-xs';
    common.scrollLast();

  }
  newData() {
    common.scrollTop();
    this.setState({ data: this.getNewData() });
    document.getElementById('new').className = 'form come';
    document.getElementById('list').className = 'hidden';
    document.getElementById('filter').className = 'hidden';
    this.barForm();


  }
  viewDetail(item) {
    this.props.show();

    //Copy Header of selected item to show on detail screen
    document.getElementById("table-detail-head").innerHTML = document.getElementById("table-risk-profit-head").outerHTML;

    //Copy Row of selected item on detail screen
    document.getElementById("table-detail-body").innerHTML = document.getElementById(item.event + '_' + item.date).outerHTML;

    common.postData('report/risk-profit-detail', item).then((data) => {
      this.props.hide();
      common.scrollTop();
      this.setState({ details: data })
      document.getElementById('list').className = 'hidden';
      document.getElementById('filter').className = 'hidden';
      document.getElementById('detail').className = 'form come';
      this.barForm(item.conta);
    });
  }
  bindList() {

    let months = this.state.view_id.indexOf('month') > 0 ? this.getMonths() : this.getWeeks();

    this.setState({
      itemsAll: [],
      items: [],
      itemsTopWinAll: [],
      itemsTopWin: [],
      itemsTopLostAll: [],
      itemsTopLost: [],
      dataByMonthLogin: [],
      dataByMonthClient: [],
      dataByMonthLoginAll: [],
      dataByMonthClientAll: [],
      months: months,
    });
    if (this.state.view_id === 'total-by-day')
      this.bindTotalsByDay();
    if (this.state.view_id === 'top-profit')
      this.bindTopWinLost();
    if (this.state.view_id === 'by-month-login' || this.state.view_id === 'by-week-login')
      this.bindReportByMonthLogin();
    if (this.state.view_id === 'by-month-client' || this.state.view_id === 'by-week-client')
      this.bindReportByMonthClient();

  }
  bindTopWinLost() {
    let date_from = formatDate(this.state.date_from, "YYYY-MM-DD");
    let date_to = formatDate(this.state.date_to, "YYYY-MM-DD");
    this.props.show();
    var that = this;
    common.getData(`report/bets-top-win/${date_from}/${date_to}`).then((data) => { that.props.hide(); this.setState({ itemsTopWin: data, itemsTopWinAll: data }) });
    common.getData(`report/bets-top-lost/${date_from}/${date_to}`).then((data) => { that.props.hide(); this.setState({ itemsTopLost: data, itemsTopLostAll: data }) });

  }
  bindTotalsByDay() {
    let date_from = formatDate(this.state.date_from, "YYYY-MM-DD");
    let date_to = formatDate(this.state.date_to, "YYYY-MM-DD");
    this.props.show();
    var that = this;
    common.getData(`report/totals-by-day/${date_from}/${date_to}`).then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) });
  }
  bindReportByMonthLogin() {
    this.props.show();
    var that = this;
    let period = this.state.view_id.indexOf('month') > 0 ? this.state.year : formatDate(this.state.date_from_one_month_ago, 'YYYY-MM-DD');
    common.getData(`report/get-by-month/${this.state.view_id}/` + period).then((data) => {
      that.props.hide();
      let tableByLogin = [];

      data.forEach(x => {
        //By Login
        let rowByLogin = tableByLogin.find(y => y && y.login_name === x.login_name && x.bookmaker_name == y.bookmaker_name);
        if (rowByLogin == null)
          tableByLogin.push({ login_name: x.login_name, bookmaker_name: x.bookmaker_name, [x.placement_date]: { parcial: x.parcial, resultado: x.resultado, volume: x.volume, qtd: x.qtd, comissao: x.comissao }, total: { parcial: isNaN(x.parcial) ? 0 : x.parcial, resultado: x.resultado, volume: x.volume, qtd: x.qtd, comissao: x.comissao } });
        else {
          rowByLogin[x.placement_date] = { parcial: x.parcial, resultado: x.resultado, volume: x.volume, qtd: x.qtd, comissao: x.comissao };
          rowByLogin.total.parcial = Number(rowByLogin.total.parcial) + Number(isNaN(x.parcial) ? 0 : x.parcial);
          rowByLogin.total.resultado = Number(rowByLogin.total.resultado) + Number(x.resultado);
          rowByLogin.total.volume = Number(rowByLogin.total.volume) + Number(x.volume);
          rowByLogin.total.comissao = Number(rowByLogin.total.comissao) + Number(x.comissao);
          rowByLogin.total.qtd = Number(rowByLogin.total.qtd) + Number(x.qtd);
        }

      });
      console.log(tableByLogin);
      this.setState({ dataByMonthLogin: tableByLogin, dataByMonthLoginAll: tableByLogin })
    });
  }
  bindReportByMonthClient() {
    this.props.show();
    var that = this;
    let period = this.state.view_id.indexOf('month') > 0 ? this.state.year : formatDate(this.state.date_from_one_month_ago, 'YYYY-MM-DD');
    common.getData(`report/get-by-month/${this.state.view_id}/` + period).then((data) => {
      that.props.hide();
      let tableByClient = [];

      data.forEach(x => {
        //By Client

        let rowByClient = tableByClient.find(y => y && y.bookmaker_name === x.bookmaker_name);
        if (rowByClient == null)
          tableByClient.push({ bookmaker_name: x.bookmaker_name, [x.placement_date]: { parcial: x.parcial, resultado: x.resultado, volume: x.volume, qtd: x.qtd, comissao: x.comissao }, total: { parcial: x.parcial, resultado: x.resultado, volume: x.volume, qtd: x.qtd, comissao: x.comissao } });
        else {
          rowByClient[x.placement_date] = { parcial: x.parcial, resultado: x.resultado, volume: x.volume, qtd: x.qtd, comissao: x.comissao };
          rowByClient.total.parcial = Number(rowByClient.total.parcial) + Number(x.parcial);
          rowByClient.total.resultado = Number(rowByClient.total.resultado) + Number(x.resultado);
          rowByClient.total.volume = Number(rowByClient.total.volume) + Number(x.volume);
          rowByClient.total.comissao = Number(rowByClient.total.comissao) + Number(x.comissao);
          rowByClient.total.qtd = Number(rowByClient.total.qtd) + Number(x.qtd);
        }
      });

      this.setState({ dataByMonthClient: tableByClient, dataByMonthClientAll: tableByClient });
    });
  }
  componentDidMount() {
    this.bindList();
    let years = [];
    for (let index = 2016; index <= new Date().getFullYear(); index++)
      years.push(index);
    this.setState({ years });


  }
  state = {
    items: [],
    itemsTopWin: [],
    itemsTopLost: [],
    dataByMonthLogin: [],
    dataByMonthClient: [],
    itemsAll: [],
    itemsTopWinAll: [],
    itemsTopLostAll: [],
    date_from: this.getLastMonday(),
    date_to: new Date(this.getLastMonday()).addDays(6),
    months: [],
    view_id: 'total-by-day',
    years: [],
    year: new Date().getFullYear(),
    showParcial: true,
    date_from_one_month_ago: this.getLastFourthMonday()
  }
  getMonths() {
    let months = [{ id: "01", name: "Jan" }, { id: "02", name: "Fev" }, { id: "03", name: "Mar" }, { id: "04", name: "Abr" }, { id: "05", name: "Mai" }, { id: "06", name: "Jun" },
    { id: "07", name: "Jul" }, { id: "08", name: "Ago" }, { id: "09", name: "Set" }, { id: "10", name: "Out" }, { id: "11", name: "Nov" }, { id: "12", name: "Dez" }
    ];
    return months;
  }
  getWeeks() {
    let months = [];
    months.push({ id: formatDate(this.state.date_from_one_month_ago, "YYYY-MM-DD"), name: formatDate(this.state.date_from_one_month_ago, "DD/MM") });
    let dt = this.state.date_from_one_month_ago;
    for (let index = 0; index < 11; index++) {
      dt = dt.addDays(7);
      months.push({ id: formatDate(dt, "YYYY-MM-DD"), name: formatDate(dt, "DD/MM") });
    }
    return months;
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
  getLastFourthMonday() {
    let lastMonday = this.getLastMonday();
    lastMonday = lastMonday.addDays(-21);
    return lastMonday;
  }
  handleChange = e => {
    let data = this.state.data;
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
  handleDayChange(selectedDay, modifiers, dayPickerInput) {
    this.setState({ [dayPickerInput.props.name]: selectedDay })

    setTimeout(() => {
      this.bindList();
    }, 1);

  }
  changeWeek = (signal) => {
    let date_from = this.state.date_from.addDays(7 * signal);
    let date_to = this.state.date_to.addDays(7 * signal);
    let date_from_one_month_ago = this.state.date_from_one_month_ago.addDays(7 * signal);
    this.setState({ date_from, date_to, date_from_one_month_ago });
    setTimeout(() => {
      this.bindList();
    }, 1);
    setTimeout(() => { this.hideFilter() }, 1000);

  }
  filter(e) {
    let items = [];
    let dataName = 'dataByMonthLogin';
    let dataNameAll = 'dataByMonthLoginAll';
    if (this.state.view_id === 'by-month-client') {
      dataName = 'dataByMonthClient';
      dataNameAll = 'dataByMonthClientAll';
    }
    if (e.target.value == '') {
      items = this.state[dataNameAll];
    }
    else {
      let value = e.target.value.toUpperCase();
      items = this.state[dataNameAll].filter(x =>
        (x.bookmaker_name + "").toUpperCase().indexOf(value) >= 0 ||
        (x.login_name + "").toUpperCase().indexOf(value) >= 0);
    }
    this.setState({ [dataName]: items });
  }
  handleViewChange = (e) => {
    this.props.show();
    this.setState({ view_id: e.target.value });
    setTimeout(() => { this.bindList(); this.hideFilter() }, 500);
  }
  handleYearChange = (e) => {
    this.props.show();
    this.setState({ year: e.target.value });
    setTimeout(() => {
      this.bindList();
      this.hideFilter()
    },
      500);
  }
  handleReportField = (e) => {

    this.setState({ [e.target.name]: !this.state[e.target.name] });
  }
  render() {

    return (
      <React.Fragment>
        <div className="filter hidden-xs" id="filter">
          <div className="row no-gutters" >
            <div className="col-12 col-sm-3 p-1">
              <input type="text" className="form-control form-control-sm" placeholder="Buscar..." onChange={this.filter.bind(this)} />
            </div>
            <div className="col-12 col-sm-3 p-1" hidden={this.state.view_id !== "by-month-login" && this.state.view_id !== "by-month-client"}>
              <select name="year" value={this.state.year} className="form-control form-control-sm" onChange={this.handleYearChange} >
                {this.state.years.map(x => <option key={x} value={x}>{x}</option>)};
              </select>
            </div>
            <div className="col-6 col-sm-2 p-1" hidden={this.state.view_id !== "total-by-day" && this.state.view_id !== "top-profit"}>
              <DayPickerInput name="date_from" dayPickerProps={{ selectedDay: this.state.date_from }}
                placeholder={formatDate(this.state.date_from, 'DD/MM/YYYY')} onDayChange={this.handleDayChange.bind(this)} parseDate={parseDate} formatDate={formatDate}
                dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{ readOnly: true }} />
            </div>
            <div className="col-6 col-sm-2 p-1 date-to" hidden={this.state.view_id !== "total-by-day" && this.state.view_id !== "top-profit"}>
              <DayPickerInput name="date_to"
                placeholder={formatDate(this.state.date_to, 'DD/MM/YYYY')} onDayChange={this.handleDayChange.bind(this)} parseDate={parseDate} formatDate={formatDate}
                dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{ readOnly: true }} />
            </div>
            <div className="col-12 col-sm-4 p-1 date-to" hidden={this.state.view_id !== "by-week-login" && this.state.view_id !== "by-week-client"}>
              <DayPickerInput name="date_to"
                placeholder={formatDate(this.state.date_from_one_month_ago, 'DD/MM/YYYY')} onDayChange={this.handleDayChange.bind(this)} parseDate={parseDate} formatDate={formatDate}
                dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{ readOnly: true }} />
            </div>
            <div className="col-12 col-sm-3 p-1">
              <select type="text" className="form-control form-control-sm" name="view_id" onChange={this.handleViewChange} >
                <option value="total-by-day" >Totais por Dia</option>
                <option value="top-profit" >Top Lucro e Prejúizo</option>
                <option value="by-week-login" >Totais Semanais por Login</option>
                <option value="by-week-client" >Totais Semanais por Cliente</option>
                <option value="by-month-login" >Totais Mensais por Login</option>
                <option value="by-month-client" >Totais Mensais por Cliente</option>
              </select>
            </div>
            <div className="col-12 col-sm-2 p-1 align-self-center text-center">
              <i className="fas fa-arrow-left mr-4 text-secondary font-icon pointer" onClick={this.changeWeek.bind(this, -1)} ></i>
              <i className="fas fa-arrow-right  text-secondary font-icon pointer" onClick={this.changeWeek.bind(this, 1)} ></i>
            </div>
            <div className="col-12 text-center button-options button-options-report" hidden={this.state.view_id.indexOf('by-month') < 0 && this.state.view_id.indexOf('by-week') < 0} >
              <button type="button" className={'btn btn-sm first ' + (this.state.showParcial ? 'btn-secondary' : 'btn-outline-secondary')} name="showParcial" onClick={this.handleReportField} >Parcial</button>
              <button type="button" className={'btn btn-sm ' + (this.state.showComissao ? 'btn-secondary' : 'btn-outline-secondary')} name="showComissao" onClick={this.handleReportField} >Com</button>
              <button type="button" className={'btn btn-sm ' + (this.state.showResultado ? 'btn-secondary' : 'btn-outline-secondary')} name="showResultado" onClick={this.handleReportField} >Result</button>
              <button type="button" className={'btn btn-sm last ' + (this.state.showQtd ? 'btn-secondary' : 'btn-outline-secondary')} name="showQtd" onClick={this.handleReportField} >Qtd</button>
            </div>

          </div>
        </div>
        <div className="margin-top-filter margin-top-filter-xs" ></div>
        <div id="list" className="table-responsive">
          <table className={'table table-dark table-hover table-bordered table-striped table-sm ' + (this.state.view_id === 'total-by-day' ? '' : 'hidden')} >
            <thead id="table-risk-profit-head" >
              <tr className="no-border-bottom">
                <th className="text-center bg-dark" colSpan="5"> Totais Por Dia</th>
              </tr>
              <tr className="no-border-bottom">
                <th onClick={common.tableSort.bind(this, 'date_bets')} >Data</th>
                <th onClick={common.tableSortNumber.bind(this, 'bet_count')} >Qtd</th>
                <th onClick={common.tableSortNumber.bind(this, 'total_stake')} >Apostas</th>
                <th className="hidden-xs" onClick={common.tableSortNumber.bind(this, 'total_return')} >Retorno</th>
                <th onClick={common.tableSortNumber.bind(this, 'resultado')}>Resultado</th>
              </tr>
              <tr className="no-border-bottom">
                <th></th>
                <th>{this.state.items.sumInt('bet_count')}</th>
                <th>{this.state.items.sum('total_stake')}</th>
                <th className="hidden-xs">{this.state.items.sum('total_return')}</th>
                <th>{this.state.items.sum('resultado', true)}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map((x, i) => <tr key={i} >
                <td>{x.date_bets}</td>
                <td>{x.bet_count}</td>
                <td>{common.formatNumber(x.total_stake)}</td>
                <td className="hidden-xs" >{common.formatNumber(x.total_return)}</td>
                <td>{common.formatNumber(x.resultado, true)}</td>
              </tr>)}
            </tbody>
          </table>
          <div className="row no-gutters">
            <div className="col-md-6 col-12 pr-md-1" >
              <table className={'table table-dark table-hover table-bordered table-striped table-sm table-top-win table-scroll ' + (this.state.view_id === 'top-profit' ? '' : 'hidden')} >
                <thead id="table-risk-profit-head" >
                  <tr className="no-border-bottom">
                    <th className="text-center bg-success-dark" colSpan="5"> Top Lucro</th>
                  </tr>
                  <tr className="no-border-bottom hidden-xs">
                    <th onClick={common.tableSort.bind(this, 'bet_confirmation')} >Aposta</th>
                    <th className="text-center" onClick={common.tableSortNumber.bind(this, 'total_stake')} >Stake</th>
                    <th className="text-center" onClick={common.tableSortNumber.bind(this, 'resultado')} >Resultado</th>
                    <th className="text-center" onClick={common.tableSortNumber.bind(this, 'login_name')}>Conta</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.itemsTopWin.map((x, i) => <tr key={i} >
                    <td className="hidden-xs"><div className="text-warning"><small><b>{x.placement_date}</b></small></div>{x.bet_confirmation.split('<br>').map((x, n) => <div key={n}>{x}</div>)}</td>
                    <td className="text-center middle hidden-xs">{common.formatNumber(x.total_stake)}</td>
                    <td className="text-center middle hidden-xs">{common.formatNumber(x.resultado, true)}</td>
                    <td className="text-center middle hidden-xs"><div><b>{x.login_name}</b></div>{x.bookmaker_name}</td>
                    <td className="show-xs">
                      <div>
                        <b>Stake: </b>{common.formatNumber(x.total_stake)} <b>Resultado: </b>{common.formatNumber(x.resultado, true)}
                      </div>
                      <div><b>Login:</b> {x.login_name} - {x.bookmaker_name}</div>
                      <div><b>Data: </b>{x.placement_date}</div>
                      <b>Aposta:</b><br />
                      {x.bet_confirmation.split('<br>').map((x, n) => <div key={n}>{x}</div>)}
                    </td>
                  </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="col-md-6 col-12 pl-md-1" >
              <table className={'table table-dark table-hover table-bordered table-striped table-sm table-top-win table-scroll ' + (this.state.view_id === 'top-profit' ? '' : 'hidden')} >
                <thead>
                  <tr className="no-border-bottom" >
                    <th className="text-center bg-danger" colSpan="5"> Top Prejuízo</th>
                  </tr>
                  <tr className="no-border-bottom hidden-xs">
                    <th onClick={common.tableSort.bind(this, 'bet_confirmation')} >Aposta</th>
                    <th className="text-center" onClick={common.tableSortNumber.bind(this, 'total_stake')} >Stake</th>
                    <th className="text-center" onClick={common.tableSortNumber.bind(this, 'resultado')} >Resultado</th>
                    <th className="text-center" onClick={common.tableSortNumber.bind(this, 'login_name')}>Conta</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.itemsTopLost.map((x, i) => <tr key={i} >
                    <td className="hidden-xs"><div className="text-warning"><small><b>{x.placement_date}</b></small></div>{x.bet_confirmation.split('<br>').map((x, n) => <div key={n}>{x}</div>)}</td>
                    <td className="text-center middle hidden-xs">{common.formatNumber(x.total_stake)}</td>
                    <td className="text-center middle hidden-xs">{common.formatNumber(x.resultado, true)}</td>
                    <td className="text-center middle hidden-xs"><div><b>{x.login_name}</b></div>{x.bookmaker_name}</td>
                    <td className="show-xs">
                      <div>
                        <b>Stake: </b>{common.formatNumber(x.total_stake)} <b>Resultado: </b>{common.formatNumber(x.resultado, true)}
                      </div>
                      <div><b>Login:</b> {x.login_name} - {x.bookmaker_name}</div>
                      <div><b>Data: </b>{x.placement_date}</div>
                      <b>Aposta:</b><br />
                      {x.bet_confirmation.split('<br>').map((x, n) => <div key={n}>{x}</div>)}
                    </td>
                  </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="col-12 pl-md-1" >
              <table className={'table table-dark table-bordered table-striped table-sm table-month table-month-login table-scroll ' + (this.state.view_id === 'by-month-login' || this.state.view_id === 'by-week-login' ? '' : 'hidden')} >
                <thead>
                  <tr>
                    <th className="hidden-xs" onClick={common.tableSort.bind(this, 'login_name', 'dataByMonthLogin')} >Login</th>
                    <th className="hidden-xs" onClick={common.tableSort.bind(this, 'bookmaker_name', 'dataByMonthLogin')} >Cliente</th>
                    <th className="hidden-xs" onClick={common.tableSortNumber.bind(this, ['total', 'parcial'], 'dataByMonthLogin')} >Total</th>
                    {this.state.months.map(x => <th key={x.id} className="month hidden-xs" onClick={common.tableSortNumber.bind(this, [x.id, 'parcial'], 'dataByMonthLogin')} >{x.name}</th>)}
                    <th className="show-xs" >Parcial Mensal por Login em {this.state.year}</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.dataByMonthLogin.map((x, i) => <tr key={i} >
                    <td className="hidden-xs">{x.login_name}</td>
                    <td className="hidden-xs">{x.bookmaker_name}</td>
                    <td className="text-right hidden-xs">
                      <div hidden={!this.state.showParcial}> {common.formatNumber(x.total.parcial, true)}</div>
                      <div hidden={!this.state.showComissao}> {common.formatNumber(x.total.comissao, true)}</div>
                      <div hidden={!this.state.showResultado}> {common.formatNumber(x.total.resultado, true)}</div>
                      <div hidden={!this.state.showQtd}> {x.total.qtd}</div>
                      <div hidden={!this.state.showVolume}> {common.formatNumber(x.total.volume, true)}</div>
                    </td>
                    {this.state.months.map((y, n) => <td key={n} className="month hidden-xs" >
                      <div hidden={!this.state.showParcial}> {common.formatNumber(x[y.id] ? x[y.id].parcial : null, true)}</div>
                      <div hidden={!this.state.showComissao}> {common.formatNumber(x[y.id] ? x[y.id].comissao : null, true)}</div>
                      <div hidden={!this.state.showResultado}> {common.formatNumber(x[y.id] ? x[y.id].resultado : null, true)}</div>
                      <div hidden={!this.state.showQtd}> {x[y.id] ? x[y.id].qtd : null}</div>
                      <div hidden={!this.state.showVolume}> {common.formatNumber(x[y.id] ? x[y.id].volume : null, true)}</div>
                    </td>)}
                    <td className="show-xs p-0">
                      <div className="label-login"><b>{x.login_name} - {x.bookmaker_name}</b></div>
                      <div className="total"><b>Total:</b> {common.formatNumber(x.total, true, ['red-dark', 'yellow-dark', 'green-dark'])}</div>
                      <div className="row no-gutters mt-1" >
                        {this.state.months.map((y, n) => <div key={n} className={'month col-4 text-center month-' + y.id} >
                          <div><b>{y.name}</b></div>
                          <div hidden={!this.state.showParcial}> {common.formatNumber(x[y.id] ? x[y.id].parcial : null, true)}</div>
                          <div hidden={!this.state.showComissao}> {common.formatNumber(x[y.id] ? x[y.id].comissao : null, true)}</div>
                          <div hidden={!this.state.showResultado}> {common.formatNumber(x[y.id] ? x[y.id].resultado : null, true)}</div>
                          <div hidden={!this.state.showQtd}> {x[y.id] ? x[y.id].qtd : null}</div>
                          <div hidden={!this.state.showVolume}> {common.formatNumber(x[y.id] ? x[y.id].volume : null, true)}</div>
                        </div>)}
                      </div>
                    </td>
                  </tr>)}
                </tbody>
              </table>
              <table className={'table table-dark table-bordered table-striped table-sm table-month table-month-client table-scroll ' + (this.state.view_id === 'by-month-client' || this.state.view_id === 'by-week-client' ? '' : 'hidden')} >
                <thead>
                  <tr>
                    <th className="hidden-xs" onClick={common.tableSort.bind(this, 'bookmaker_name', 'dataByMonthClient')} >Cliente</th>
                    <th className="hidden-xs" onClick={common.tableSortNumber.bind(this, 'total', 'dataByMonthClient')} >Total</th>
                    {this.state.months.map(x => <th key={x.id} className="month hidden-xs" onClick={common.tableSortNumber.bind(this, x.id, 'dataByMonthClient')} >{x.name}</th>)}
                    <th className="show-xs" >Parcial Mensal por Cliente em {this.state.year}</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.dataByMonthClient.map((x, i) => <tr key={i} >
                    <td className="hidden-xs">{x.bookmaker_name}</td>
                    <td className="text-right hidden-xs">
                      <div hidden={!this.state.showParcial}> {common.formatNumber(x.total.parcial, true)}</div>
                      <div hidden={!this.state.showComissao}> {common.formatNumber(x.total.comissao, true)}</div>
                      <div hidden={!this.state.showResultado}> {common.formatNumber(x.total.resultado, true)}</div>
                      <div hidden={!this.state.showQtd}> {x.total.qtd}</div>
                      <div hidden={!this.state.showVolume}> {common.formatNumber(x.total.volume, true)}</div>
                    </td>
                    {this.state.months.map((y, n) => <td key={n} className="month hidden-xs" >
                      <div hidden={!this.state.showParcial}> {common.formatNumber(x[y.id] ? x[y.id].parcial : null, true)}</div>
                      <div hidden={!this.state.showComissao}> {common.formatNumber(x[y.id] ? x[y.id].comissao : null, true)}</div>
                      <div hidden={!this.state.showResultado}> {common.formatNumber(x[y.id] ? x[y.id].resultado : null, true)}</div>
                      <div hidden={!this.state.showQtd}> {x[y.id] ? x[y.id].qtd : null}</div>
                      <div hidden={!this.state.showVolume}> {common.formatNumber(x[y.id] ? x[y.id].volume : null, true)}</div>
                    </td>)}
                    <td className="show-xs p-0">
                      <div className="label-login"><b>{x.bookmaker_name}</b></div>
                      <div className="total"><b>Total:</b> {common.formatNumber(x.total, true, ['red-dark', 'yellow-dark', 'green-dark'])}</div>
                      <div className="row no-gutters mt-1" >
                        {this.state.months.map((y, n) => <div key={n} className={'month col-4 text-center month-' + y.id} >
                          <div><b>{y.name}</b></div>
                          <div hidden={!this.state.showParcial}> {common.formatNumber(x[y.id] ? x[y.id].parcial : null, true)}</div>
                          <div hidden={!this.state.showComissao}> {common.formatNumber(x[y.id] ? x[y.id].comissao : null, true)}</div>
                          <div hidden={!this.state.showResultado}> {common.formatNumber(x[y.id] ? x[y.id].resultado : null, true)}</div>
                          <div hidden={!this.state.showQtd}> {x[y.id] ? x[y.id].qtd : null}</div>
                          <div hidden={!this.state.showVolume}> {common.formatNumber(x[y.id] ? x[y.id].volume : null, true)}</div>
                        </div>)}
                      </div>
                    </td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="page-margin-bottom" ></div>
      </React.Fragment>
    );
  }
}
export default withRouter(Reports);
