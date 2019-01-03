import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
// HCY=Y
import DateCombo from './DateCombo'
import CurrencyFormat from 'react-currency-format';
import * as common from './Common';
import ReactTooltip from 'react-tooltip';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import MomentLocaleUtils, { formatDate, parseDate } from 'react-day-picker/moment';
import 'moment/locale/pt-br';

class RiskProfit extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.barList();
  }
  barList() {
    this.props.changeTitle({ left: <div><i className="fas fa-futbol"></i> HULK BET</div>, center: 'Risco e Lucro' });
  }
  barForm = (title) => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={() => this.back()}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div>, center: title });
  }
  back() {
    this.barList();
    document.getElementById('detail').className = 'form go';
    document.getElementById('list').className = '';
    document.getElementById('filter').className = 'filter';
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
    common.getData('combo/risk-profit-event').then((events) => { this.setState({ events }); });
    common.postData(`report/risk-profit`, "").then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) });
  }
  componentDidMount() {

    //Get list
    this.bindList();
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
    this.setState({ data })

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

  render() {
    return (
      <React.Fragment>
        <div className="filter" id="filter" >
          <div className="row no-gutters" >
            <div className="col-12 col-sm-6 p-1">
              <select className="form-control form-control-sm" name="event_name" value={this.state.event_name} onChange={this.filterEvent.bind(this)} >
                <option value="" >Eventos</option>
                {this.state.events.map((x, i) => <option key={i} value={x.event_date + ' - ' + x.event_key} >{x.event_date + ' - ' + x.event_key}</option>)}
              </select>
            </div>
            <div className="col-12 col-sm-6 p-1">
              <input type="text" className="form-control form-control-sm" placeholder="Buscar..." onChange={this.filter.bind(this)} />
            </div>
          </div>
        </div>
        <div className="margin-top-filter margin-top-filter-xs" ></div>
        <div id="list">
          <table className="table table-dark table-hover table-bordered table-striped table-sm" >
            <thead id="table-risk-profit-head" >
              <tr>
                <th>NR</th>
                <th>Evento</th>
                <th className="hidden-xs">Data</th>
                <th>Qtd</th>
                <th className="hidden-xs">Casa</th>
                <th className="hidden-xs">Empate</th>
                <th className="hidden-xs">Visitante</th>
                <th className="show-xs">Valores</th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map((x, i) => <tr key={i} id={x.event + '_' + x.date} onClick={this.viewDetail.bind(this, x)} >
                <td>{i + 1}</td>
                <td>{x.event}<div className="show-xs" >{x.date}</div></td>
                <td className="hidden-xs"  >{x.date}</td>
                <td>{x.bet_count}</td>
                <td className={x.home_value == 0 ? "hidden-xs yellow" : x.home_value < 0 ? 'hidden-xs red' : 'hidden-xs green'} >{common.formatNumber(x.home_value)}</td>
                <td className={x.draw_value == 0 ? "hidden-xs yellow" : x.draw_value < 0 ? 'hidden-xs red' : 'hidden-xs green'}>{common.formatNumber(x.draw_value)}</td>
                <td className={x.visitor_value == 0 ? "hidden-xs yellow" : x.visitor_value < 0 ? 'hidden-xs red' : 'hidden-xs green'}>{common.formatNumber(x.visitor_value)}</td>
                <td className="show-xs">
                  <div><b>C:</b> <span className={x.home_value == 0 ? "yellow" : x.home_value < 0 ? 'red' : 'green'} >{common.formatNumber(x.home_value)}</span></div>
                  <div><b>E:</b> <span className={x.draw_value == 0 ? "yellow" : x.draw_value < 0 ? 'red' : 'green'} >{common.formatNumber(x.draw_value)}</span></div>
                  <div><b>V:</b> <span className={x.visitor_value == 0 ? "yellow" : x.visitor_value < 0 ? 'red' : 'green'} >{common.formatNumber(x.visitor_value)}</span></div>
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
                  <th >NR</th>
                  <th onClick={common.tableSort.bind(this, 'event_name')} >Evento</th>
                  <th onClick={common.tableSort.bind(this, 'selection')} className="hidden-xs" >Seleção</th>
                  <th onClick={common.tableSort.bind(this, 'stake')} >Aposta</th>
                  <th onClick={common.tableSort.bind(this, 'odds')} >Cotação</th>
                  <th onClick={common.tableSort.bind(this, 'result')} className="text-center" >Resultado</th>
                </tr>
              </thead>
              <tbody>
                {this.state.details.map((x, i) => <tr key={x.id}  >
                  <td>{i + 1}</td>
                  <td>{x.event_name}<div className="show-xs"><b>{x.selection}</b></div></td>
                  <td className="hidden-xs">{x.selection}</td>
                  <td>{common.formatNumber(x.stake)}</td>
                  <td>{common.formatNumber(x.odds)}</td>
                  <td className={'text-center ' + x.result.substr(0, 4)}>{x.result}</td>
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

export default withRouter(RiskProfit);
