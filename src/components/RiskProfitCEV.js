import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';
import 'react-day-picker/lib/style.css';
import MomentLocaleUtils, { formatDate } from 'react-day-picker/moment';
import 'moment/locale/pt-br';

class RiskProfitCEV extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.barList();
  }

  barList() {
    this.props.changeTitle({
      left: null,
      center:
        <div className="pointer" onClick={this.bindList.bind(this)}  >Risco CEV
          <small className="last-update" >{this.state.lastBetTime ? "Atualização: " + formatDate(this.state.lastBetTime.date, "DD/MM H:mm") + "  há " + this.state.lastBetTime.minutes + " min atrás" : ""}</small>
        </div>,
      right: <div className="" onClick={this.showFilter.bind(this)}><i className="fas fa-filter show-xs"></i></div>
    });
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
    if (this.hideFilter())
      return;
    this.props.show();

    //Copy Header of selected item to show on detail screen
    document.getElementById("table-detail-head").innerHTML = document.getElementById("table-risk-profit-head").outerHTML;

    //Copy Row of selected item on detail screen
    document.getElementById("table-detail-body").innerHTML = document.getElementById(item.event + '_' + item.date).outerHTML;

    common.postData('report/risk-profit-cev-detail', item).then((data) => {
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
    common.getData('combo/risk-profit-event').then((events) => {
      this.setState({ events });
    });
    common.postData(`report/risk-profit-cev`, "").then((data) => {
      that.props.hide();
      data.sort((a, b) => a['risk_value'] - b['risk_value'])
      this.setState({ items: data, itemsAll: data, sortField: 'risk_value' });
    });
  }
  componentDidMount() {

    //Get list
    this.bindList();
    //Last Update Date
    common.getData('bet/data/last-bet-pending-time').then((data) => { this.setState({ lastBetTime: data }); this.barList(); })
  }
  state = {
    itemsAll: [],
    items: [],
    events: [],
    details: [],
    date_from: this.getLastMonday(),
    date_to: new Date(this.getLastMonday()).addDays(6)
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
  getNewData() {

    return {

    }
  }
  handleChange = e => {
    let data = this.state.data;
    data[e.target.name] = e.target.value;
    this.setState({ data });

  }
  showFilter() {
    var css = document.getElementById('filter').className;
    if (css.indexOf('hidden-xs') > 0) {
      css = 'filter';
      this.setState({ filterOpen: true });
    } else {
      css = 'filter hidden-xs';
      this.setState({ filterOpen: false });
    }
    document.getElementById('filter').className = css;
  }
  filter(e) {
    let items = [];
    if (e.target.value == '')
      items = this.state.itemsAll;
    else {
      let value = e.target.value.toUpperCase();
      items = this.state.itemsAll.filter(x =>
        (x.event.toUpperCase() + "").indexOf(value) >= 0);
    }
    this.setState({ items });
  }
  filterEvent(e) {

    document.getElementById('filter').className = 'filter hidden-xs';

    let items = [];
    if (e.target.value == '')
      items = this.state.itemsAll;
    else {
      let value = e.target.value.split(' - ')[1];
      items = this.state.itemsAll.filter(x =>
        (x.event).indexOf(value) >= 0);
    }
    this.setState({ items });
  }
  handleDayChange(selectedDay, modifiers, dayPickerInput) {
    this.setState({ [dayPickerInput.props.name]: selectedDay })

    setTimeout(() => {
      this.bindList();
    }, 1);

  }
  handleSortXS = () => {
    let items = this.state.items;
    let values = []
    let key = 'valores';
    let field = '';
    if (this.state.sortField === key) {
      values.push({ field: 'home_value', value: items.sort((a, b) => a['home_value'] - b['home_value'])[0]['home_value'] });
      values.push({ field: 'draw_value', value: items.sort((a, b) => a['draw_value'] - b['draw_value'])[0]['draw_value'] });
      values.push({ field: 'visitor_value', value: items.sort((a, b) => a['visitor_value'] - b['visitor_value'])[0]['visitor_value'] });
      field = values.sort((a, b) => a['value'] - b['value'])[0]['value']
      items.sort((a, b) => a[field] - b[field])
    }
    else {
      values.push({ field: 'home_value', value: items.sort((a, b) => b['home_value'] - a['home_value'])[0]['home_value'] });
      values.push({ field: 'draw_value', value: items.sort((a, b) => b['draw_value'] - a['draw_value'])[0]['draw_value'] });
      values.push({ field: 'visitor_value', value: items.sort((a, b) => b['visitor_value'] - a['visitor_value'])[0]['visitor_value'] });
      field = values.sort((a, b) => a['value'] - b['value'])[0]['value']
      items.sort((a, b) => b[field] - a[field])
    }
    this.setState({ items: items, sortField: (key === this.state.sortField ? '' : key) });
  }
  sortByRisk = () => {
    common.sortNumber(this, 'risk_value');
  }
  sortByProfit = () => {
    common.sortNumber(this, 'profit_value');
  }
  hideFilter = (e) => {

    if (this.state.filterOpen) {
      document.getElementById('filter').className = 'filter hidden-xs';
      this.setState({ filterOpen: false });
      return true;
    }
    return false;

  }
  render() {
    return (
      <React.Fragment>
        <div className="filter hidden-xs" id="filter" >
          <div className="row no-gutters" >
            <div className="col-12 col-sm-4 p-1">
              <select className="form-control form-control-sm" name="event_name" value={this.state.event_name} onChange={this.filterEvent.bind(this)} >
                <option value="" >Eventos</option>
                {this.state.events.map((x, i) => <option key={i} value={x.event_date + ' - ' + x.event_key} >{x.event_date + ' - ' + x.event_key}</option>)}
              </select>
            </div>
            <div className="col-12 col-sm-4 p-1">
              <input type="text" className="form-control form-control-sm" placeholder="Buscar..." onChange={this.filter.bind(this)} />
            </div>
            <div className="col-12 col-sm-4 p-1 text-right-xs">
              <button className="btn btn-sm btn-danger mr-1" onClick={this.sortByRisk.bind(this)} >Risco <i className="fas fa-arrows-alt-v ml-1"></i></button>
              <button className="btn btn-sm btn-success mr-1" onClick={this.sortByProfit.bind(this)} >Lucro <i className="fas fa-arrows-alt-v ml-1"></i></button>
            </div>
          </div>
        </div>
        <div className="margin-top-filter margin-top-filter-xs" ></div>
        <div id="list">
          <table className="table table-dark table-hover table-bordered table-striped table-sm"  >
            <thead id="table-risk-profit-head" >
              <tr>
                <th className="center">NR</th>
                <th onClick={common.tableSort.bind(this, 'event')} >Evento</th>
                <th onClick={common.tableSort.bind(this, 'date')} className="hidden-xs">Data</th>
                <th className="center" onClick={common.tableSortNumber.bind(this, 'bet_count')} >Qtd</th>
                <th onClick={common.tableSortNumber.bind(this, 'home_value')} className="hidden-xs">Casa</th>
                <th onClick={common.tableSortNumber.bind(this, 'draw_value')} className="hidden-xs">Empate</th>
                <th onClick={common.tableSortNumber.bind(this, 'visitor_value')} className="hidden-xs">Visitante</th>
                <th className="show-xs" onClick={this.handleSortXS.bind(this)} >Valores</th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map((x, i) => <tr key={i} id={x.event + '_' + x.date} onClick={this.viewDetail.bind(this, x)} >
                <td className="middle-center">{i + 1}</td>
                <td>{x.event}<div className="show-xs" >{formatDate(x.date, "DD-MM-YY")}</div></td>
                <td className="hidden-xs"  >{formatDate(x.date, "DD-MM-YY")}</td>
                <td className="middle-center">{x.bet_count}</td>
                <td className={x.home_value == 0 ? "hidden-xs yellow" : x.home_value < 0 ? 'hidden-xs red' : 'hidden-xs green'} >{common.formatNumber(x.home_value)}</td>
                <td className={x.draw_value == 0 ? "hidden-xs yellow" : x.draw_value < 0 ? 'hidden-xs red' : 'hidden-xs green'}>{common.formatNumber(x.draw_value)}</td>
                <td className={x.visitor_value == 0 ? "hidden-xs yellow" : x.visitor_value < 0 ? 'hidden-xs red' : 'hidden-xs green'}>{common.formatNumber(x.visitor_value)}</td>
                <td className="show-xs">
                  <div className="no-break"><b>C:</b> <span className={x.home_value == 0 ? "yellow" : x.home_value < 0 ? 'red' : 'green'} >{common.formatNumber(x.home_value)}</span></div>
                  <div className="no-break"><b>E:</b> <span className={x.draw_value == 0 ? "yellow" : x.draw_value < 0 ? 'red' : 'green'} >{common.formatNumber(x.draw_value)}</span></div>
                  <div className="no-break"><b>V:</b> <span className={x.visitor_value == 0 ? "yellow" : x.visitor_value < 0 ? 'red' : 'green'} >{common.formatNumber(x.visitor_value)}</span></div>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div id="detail" className="form">
          <div className="table-responsive" >
            <table className="table table-dark table-hover table-bordered table-striped table-sm mt-1" >
              <thead id="table-detail-head" >
              </thead>
              <tbody id="table-detail-body" >
              </tbody>
            </table>
            <table className="table table-dark table-bordered table-striped table-sm mt-1" >
              <thead>
                <tr>
                  <th>NR</th>
                  <th onClick={common.tableSort.bind(this, 'selection')} className="hidden-xs" >Seleção</th>
                  <th onClick={common.tableSort.bind(this, 'event_name')} >Evento</th>
                  <th onClick={common.tableSort.bind(this, 'login_name')} >Login</th>
                  <th onClick={common.tableSort.bind(this, 'stake')} >Aposta</th>
                  <th onClick={common.tableSort.bind(this, 'odds')} className="hidden-xs" >Cotação</th>
                  <th onClick={common.tableSort.bind(this, 'total_return_potential')} >Retorno</th>
                  {/* <th onClick={common.tableSort.bind(this, 'result')} className="text-center" >Res</th> */}
                </tr>
              </thead>
              <tbody>
                {this.state.details.map((x, i) => <tr key={i}  >
                  <td>{i + 1}</td>
                  <td className="hidden-xs">{x.selection}</td>
                  <td>{x.event_name}<div className="show-xs yellow"><b>{x.selection}</b></div></td>
                  <td>{x.login_name} ({x.profit_percent})</td>
                  <td>{common.formatNumber(x.stake)}<div className="show-xs">@{x.odds}</div></td>
                  <td className="hidden-xs" >{common.formatNumber(x.odds)}</td>
                  <td>{common.formatNumber(x.total_return_potential)}</td>
                  {/* <td className={'text-center ' + x.result.substr(0, 4)}>{x.result}</td> */}
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>
        <div className="page-margin-bottom" ></div>
      </React.Fragment>
    );
  }
}

export default withRouter(RiskProfitCEV);
