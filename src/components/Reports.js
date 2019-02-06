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
    this.props.changeTitle({ left: null, center: 'Indicadores', right: <div className="" onClick={this.showFilter.bind(this)}><i className="fas fa-filter show-xs"></i></div> });
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
    this.props.show();
    var that = this;
    let date_from = formatDate(this.state.date_from, "YYYY-MM-DD");
    let date_to = formatDate(this.state.date_to, "YYYY-MM-DD");
    common.getData(`report/totals-by-day/${date_from}/${date_to}`).then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) });
    common.getData(`report/bets-top-win/${date_from}/${date_to}`).then((data) => { that.props.hide(); this.setState({ itemsTopWin: data, itemsTopWinAll: data }) });
    common.getData(`report/bets-top-lost/${date_from}/${date_to}`).then((data) => { that.props.hide(); this.setState({ itemsTopLost: data, itemsTopLostAll: data }) });

    common.getData(`report/get-by-month/2019`).then((data) => {
      that.props.hide();
      let table = [];
      data.forEach(x => {
        let row = table.find(y => y && y.login_name === x.login_name);
        if (row == null)
          table.push({ login_name: x.login_name, [x.placement_date]: x.parcial });
        else
          row[x.placement_date] = x.parcial;
      });
      console.log(table);
      this.setState({ dataByMonth: table, dataByMonthAll: table })
    });
  }
  componentDidMount() {
    this.bindList();
  }
  state = {
    itemsAll: [],
    items: [],
    itemsTopWinAll: [],
    itemsTopWin: [],
    itemsTopLostAll: [],
    itemsTopLost: [],
    events: [],
    details: [],
    date_from: this.getLastMonday(),
    date_to: new Date(this.getLastMonday()).addDays(6),
    months: [{id: "01", name: "Jan"}, {id: "02", name: "Fev"},{id: "03", name: "Mar"},{id: "04", name: "Abr"},{id: "05", name: "Mai"},{id: "06", name: "Jun"},
    {id: "07", name: "Jul"},{id: "08", name: "Ago"},{id: "09", name: "Set"},{id: "10", name: "Out"},{id: "11", name: "Nov"},{id: "12", name: "Dec"}],
    dataByMonth : [],
    view_id : 'total-by-day'
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
    this.setState({ date_from, date_to });
    setTimeout(() => {
      this.bindList();
    }, 1);
    setTimeout(() => { this.hideFilter() }, 1000);

  }
  filter(e) {
    let items = [];
    let table = [];
    if (e.target.value == '') {
      items = this.state.itemsAll;
      table = this.state.tableAll;
    }
    else {
      let value = e.target.value.toUpperCase();
      items = this.state.itemsAll.filter(x =>
        (x.cliente + "").toUpperCase().indexOf(value) >= 0);

      table = this.state.tableAll.filter(x =>
        (x.bookmaker + "").toUpperCase().indexOf(value) >= 0);
    }

    this.setState({ items, table });
  }
  render() {

    return (
      <React.Fragment>
        <div className="filter hidden-xs" id="filter">
          <div className="row no-gutters" >
            <div className="col-12 col-sm-3 p-1">
              <input type="text" className="form-control form-control-sm" placeholder="Buscar..." onChange={this.filter.bind(this)} />
            </div>
            <div className="col-6 col-sm-2 p-1">
              <DayPickerInput name="date_from" dayPickerProps={{ selectedDay: this.state.date_from }}
                placeholder={formatDate(this.state.date_from, 'DD/MM/YYYY')} onDayChange={this.handleDayChange.bind(this)} parseDate={parseDate} formatDate={formatDate}
                dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{ readOnly: true }} />
            </div>
            <div className="col-6 col-sm-2 p-1 date-to">
              <DayPickerInput name="date_to"
                placeholder={formatDate(this.state.date_to, 'DD/MM/YYYY')} onDayChange={this.handleDayChange.bind(this)} parseDate={parseDate} formatDate={formatDate}
                dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{ readOnly: true }} />
            </div>
            <div className="col-12 col-sm-2 p-1">
              <select type="text" className="form-control form-control-sm" name="view_id" onChange={(e) => { this.setState({ view_id: e.target.value }) }} >
                <option value="total-by-day" >Totais por Dia</option>
                <option value="top-profit" >Top Lucro e Prejúizo</option>
                <option value="by-month" >Parcial por Login e Mês</option>
              </select>
            </div>
            <div className="col-12 col-sm-2 p-1 align-self-center text-center">
              <i className="fas fa-arrow-left mr-4 text-secondary font-icon pointer" onClick={this.changeWeek.bind(this, -1)} ></i>
              <i className="fas fa-arrow-right  text-secondary font-icon pointer" onClick={this.changeWeek.bind(this, 1)} ></i>
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
              <table className={'table table-dark table-hover table-bordered table-striped table-sm table-month table-scroll ' + (this.state.view_id === 'by-month' ? '' : 'hidden')} >
                <thead>
                  <tr>
                  <th>Login</th>
                  {this.state.months.map(x => <th key={x.id} className="month" >{x.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {this.state.dataByMonth.map((x, i) => <tr key={i} >
                  <td>{x.login_name}</td>
                  {this.state.months.map((y, n) => <td key={n}  className="month" >{common.formatNumber(x[y.id],true)}</td>)}
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
