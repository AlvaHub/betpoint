import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';
import 'react-day-picker/lib/style.css';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import MomentLocaleUtils, { formatDate, parseDate } from 'react-day-picker/moment';
import 'moment/locale/pt-br';

class RiskProfit extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.barList();

    window.addEventListener('resize', this.setColumnWitdth);
  }
  componentWillUnmount(){
    window.removeEventListener('resize', this.setColumnWitdth);
  }
  barList() {
    this.props.changeTitle({ left: null, center:  <div className="pointer" onClick={this.bindList.bind(this)} >Risco e Lucro</div>, right: <div className="" onClick={this.showFilter.bind(this)}><i className="fas fa-filter show-xs"></i></div> });
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
    common.getData(`report/risk-profit`).then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) });
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
  componentDidUpdate() {
    this.setColumnWitdth();
  }
  setColumnWitdth() {
    let w = document.getElementById('th-bet').clientWidth;
    document.documentElement.style.setProperty('--table-risk-profit-td-bet', `${w}px`);

    w = document.getElementById('th-event').clientWidth;
    document.documentElement.style.setProperty('--table-risk-profit-td-event', `${w}px`);
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
        <div className="filter hidden" id="filter" >
          <div className="row no-gutters" >
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
          </div>
        </div>
        <div className="margin-top-filter-xs" ></div>
        <div id="list" className="div-table-risk-profit">
          <table className="table table-dark table-bordered table-striped table-scroll table-risk-profit table-sm" >
            <thead id="table-risk-profit-head" >
              <tr>
                <th>Qtd</th>
                <th id="th-bet">Seleção</th>
                <th id="th-event">Evento</th>
                <th className="center" >Registro</th>
                <th className="no-break center">D.Evento</th>
                <th className="center">Aposta</th>
                <th className="center">Retorno</th>
                <th className="center">Risco</th>
                <th className="center">Lucro</th>
                <th className="center">Conta</th>
                <th className="center">Resp.</th>
              </tr>
              <tr className="no-border-top">
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th className="font-vxs middle-center">{this.state.items.sumWithComma('stakes')}</th>
                <th className="font-vxs middle-center">{this.state.items.sumWithComma('total_returns')}</th>
                <th className="red font-xs middle-center"  >{this.state.items.sum('risk')}</th>
                <th className="green font-xs middle-center" >{this.state.items.sum('profit')}</th>
                <th></th> 
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map((x, i) => <tr key={i} id={x.event + '_' + x.date} >
                <td className="middle text-center" >{x.bet_count}</td>
                <td className="td-bet">{x.bet_confirmation.split('<br>').map((y, n) => <div id={'bet-' + i + '-' + n} onClick={this.divClick.bind(this, 'bet-' + i + '-' + n)} className="no-break " key={n}>{y}</div>)}</td>
                <td className="td-event">{x.event_names_ordered.split(',').map((y, n) => <div id={'event-' + i + '-' + n} onClick={this.divClick.bind(this, 'event-' + i + '-' + n)} className="no-break " key={n}>{y}</div>)}</td>
                <td className="middle-center">{x.placement_dates.split(',').map((y, n) => <div className="no-break" key={n}>{formatDate(y, 'DD-MM-YY HH:mm:ss')}</div>)}</td>
                <td className="middle-center">{x.event_dates.split(',').map((y, n) => <div className="no-break" key={n}>{formatDate(y, 'DD-MM-YY')}</div>)}</td>
                <td className="middle-center">{x.stakes.split(',').map((y, n) => <div className="no-break" key={n}>{common.formatNumber(y)}</div>)}</td>
                <td className="middle-center">{x.total_returns.split(',').map((y, n) => <div className="no-break" key={n}>{common.formatNumber(y)}</div>)}</td>
                <td className="middle-center red">{common.formatNumber(x.risk)}</td>
                <td className="middle-center green">{common.formatNumber(x.profit)}</td>
                <td className="middle-center">{x.login_names.split(',').map((y, n) => <div className="no-break" key={n}>{y}</div>)}</td>
                <td className="middle-center">{x.bookmaker_names.split(',').map((y, n) => <div className="no-break" key={n}>{y}</div>)}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="page-margin-bottom" ></div>
      </React.Fragment>
    );
  }
}
export default withRouter(RiskProfit);
