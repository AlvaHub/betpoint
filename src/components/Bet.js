import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';
import ReactTooltip from 'react-tooltip';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import MomentLocaleUtils, { formatDate, parseDate } from 'react-day-picker/moment';
import 'moment/locale/pt-br';


class Bet extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.barList();
  }
  barList() {
    this.props.changeTitle({ left: null, center: <div className="pointer" onClick={this.bindList.bind(this)} >Consolidado</div>, right: <div className="" onClick={this.showFilter.bind(this)}><i className="fas fa-filter show-xs"></i></div> });
  }
  barForm = (title) => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={() => this.back()}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div>, center: title });
  }
  back() {
    this.barList();
    document.getElementById('detail').className = 'form  pb-0 go';
    document.getElementById('list').className = '';
    document.getElementById('filter').className = 'filter hidden-xs';
    common.scrollLast();

  }
  viewDetail(item) {
    this.props.show();

    //Copy Header of selected item to show on detail screen
    document.getElementById("table-detail-head").innerHTML = document.getElementById("table-consolidado-head").outerHTML;
    document.getElementById("table-detail-head-xs").innerHTML = document.getElementById("table-consolidado-head-xs").outerHTML;

    //Copy Row of selected item on detail screen
    document.getElementById("table-detail-body").innerHTML = document.getElementById(item.conta).outerHTML;
    document.getElementById("table-detail-body-xs").innerHTML = document.getElementById(item.conta + '-xs').outerHTML;

    let date_from = formatDate(this.state.date_from, "YYYY-MM-DD");
    let date_to = formatDate(this.state.date_to, "YYYY-MM-DD");

    common.getData('bet/detail-by-login/' + item.conta + '/' + date_from + '/' + date_to).then((data) => {
      this.props.hide();
      common.scrollTop();
      this.setState({ details: data })
      document.getElementById('list').className = 'hidden';
      document.getElementById('filter').className = 'hidden';
      document.getElementById('detail').className = 'form  pb-0 come';
      this.barForm(item.conta);
    });
  }
  bindList() {
    this.props.show();
    var that = this;
    let date_from = formatDate(this.state.date_from, "YYYY-MM-DD");
    let date_to = formatDate(this.state.date_to, "YYYY-MM-DD");
    common.getData(`bet/get-by-date/${date_from}/${date_to}`).then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) });
  }

  componentDidMount() {
    this.bindList();
  }
  componentDidUpdate() {

    let w = document.getElementById('th-event').clientWidth;
    var divsEvents = document.getElementsByClassName('td-event');
    for (let index = 0; index < divsEvents.length; index++) {
      divsEvents[index].style.maxWidth = w;
    }
    w = document.getElementById('th-bet').clientWidth;
    divsEvents = document.getElementsByClassName('td-bet');
    for (let index = 0; index < divsEvents.length; index++) {
      divsEvents[index].style.maxWidth = w;
    }
  }
  state = {
    itemsAll: [],
    items: [],
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
  save() {
    this.props.show();
    var that = this;
    common.postData('flight', this.state.data).then(function (data) {
      that.props.hide();
      that.bindList();
      that.back();
    });

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

        <div id="list">
          <div className="div-table-consolidado" >
            <table className="table table-dark table-hover table-bordered table-striped table-sm table-consolidado table-scroll hidden-xs w-100" >
              <thead id="table-consolidado-head" >
                <tr>
                  <th onClick={common.tableSort.bind(this, 'conta')} >Conta</th>
                  <th onClick={common.tableSort.bind(this, 'cliente')} >Cliente</th>
                  <th onClick={common.tableSortNumber.bind(this, 'qtd')} >Qtd</th>
                  <th onClick={common.tableSortNumber.bind(this, 'volume')} >Volume</th>
                  <th onClick={common.tableSortNumber.bind(this, 'vale')} >Vale</th>
                  <th onClick={common.tableSortNumber.bind(this, 'atual')} >Atual</th>
                  <th onClick={common.tableSortNumber.bind(this, 'pendente')} >Pend</th>
                  <th onClick={common.tableSortNumber.bind(this, 'um')} >uM</th>
                  <th onClick={common.tableSortNumber.bind(this, 'parcial')} >Parcial</th>
                  <th onClick={common.tableSortNumber.bind(this, 'comissao')} >Com</th>
                  <th onClick={common.tableSortNumber.bind(this, 'total')} >Total</th>
                  <th onClick={common.tableSortNumber.bind(this, 'profit_percent')} >%</th>
                  <th onClick={common.tableSortNumber.bind(this, 'resultado')} >Resultado</th>
                </tr>
                <tr className="font-xs totals">
                  <th></th>
                  <th></th>
                  <th>{this.state.items.sumInt('qtd')}</th>
                  <th>{this.state.items.sum('volume')}</th>
                  <th>{this.state.items.sum('vale')}</th>
                  <th>{this.state.items.sum('atual')}</th>
                  <th>{this.state.items.sum('pendente', true)}</th>
                  <th></th>
                  <th>{this.state.items.sum('parcial', true)}</th>
                  <th>{this.state.items.sum('comissao')}</th>
                  <th>{this.state.items.sum('total', true)}</th>
                  <th></th>
                  <th>{this.state.items.sum('resultado', true)}</th>
                </tr>
              </thead>
              <tbody>
                {this.state.items.map((x, i) => <tr key={i} id={x.conta} onClick={this.viewDetail.bind(this, x)} >
                  <td>{x.conta}</td>
                  <td>{x.cliente}</td>
                  <td>{x.qtd}</td>
                  <td className={x.volume == 0 ? "yellow" : x.volume < 0 ? 'red' : 'green'} >{common.formatNumber(x.volume)}</td>
                  <td>{x.vale}</td>
                  <td>{x.atual}</td>
                  <td>{x.pendente}</td>
                  <td>{x.um}</td>
                  <td>{common.formatNumber(x.parcial)}</td>
                  <td>{x.comissão}</td>
                  <td className={x.total == 0 ? "yellow" : x.total < 0 ? 'red' : 'green'} >{common.formatNumber(x.total)}</td>
                  <td>{x.profit_percent}</td>
                  <td className={x.resultado == 0 ? "" : x.resultado < 0 ? 'red' : 'green'} >{common.formatNumber(x.resultado)}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <table className="table table-dark table-hover table-bordered table-striped table-sm show-xs table-consolidado-xs table-scroll" >
            <thead id="table-consolidado-head-xs">
              <tr>
                <th>
                  <div className="row no-gutters" >
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'volume')} >Vol<small>{this.state.items.sum('volume')}</small> </div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'vale')} >Vale<small>{this.state.items.sum('vale')}</small></div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'atual')} >Atual<small>{this.state.items.sum('atual')}</small></div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'pendente')} >Pend<small>{this.state.items.sum('pendente', true)}</small></div>
                    <div className="w-100" ></div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'parcial')} >Parc<small>{this.state.items.sum('parcial', true)}</small></div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'comissao')} >Com<small>{this.state.items.sum('comissao')}</small></div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'total')} >Tot<small>{this.state.items.sum('total', true)}</small></div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'resultado')} >Res<small>{this.state.items.sum('resultado', true)}</small></div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map((x, i) => <tr key={i} id={x.conta + '-xs'} onClick={this.viewDetail.bind(this, x)} >
                <td>
                  <div className="row no-gutters" >
                    <div className="col-12 text-left pl-1" ><b>{x.conta} - {x.cliente} - {x.um} - {x.profit_percent}% - {x.qtd}</b></div>
                    {/* <div className="col-6" >
                      <b className="ml-1 text-success">Qtd</b> {x.qtd}
                      <b className="ml-1 text-warning">UM</b> {x.um}
                      <b className="ml-1 text-info">%</b> {x.profit_percent}
                     </div> */}
                    <div className="w-100" ></div>
                    <div className={x.volume == 0 ? "col-3 yellow" : x.volume < 0 ? 'col-3 red' : 'col-3 green'} >{common.formatNumber(x.volume)}</div>
                    <div className="col-3" >{x.vale}</div>
                    <div className="col-3">{x.atual}</div>
                    <div className="col-3">{x.pendente}</div>
                    <div className="w-100" ></div>
                    <div className="col-3">{common.formatNumber(x.parcial)}</div>
                    <div className="col-3">{x.comissão}</div>
                    <div className={x.total == 0 ? "col-3 yellow" : x.total < 0 ? 'col-3 red' : 'col-3 green'} >{common.formatNumber(x.total)}</div>
                    <div className={x.resultado == 0 ? "col-3" : x.resultado < 0 ? 'col-3 red' : 'col-3 green'} >{common.formatNumber(x.resultado)}</div>
                  </div>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div id="detail" className="form pb-0">
          <table className="table table-dark table-hover table-bordered table-striped table-sm mt-1 hidden-xs" >
            <thead id="table-detail-head" >
            </thead>
            <tbody id="table-detail-body" >
            </tbody>
          </table>
          <table className="table table-dark table-hover table-bordered table-striped table-sm mt-1 table-consolidado-xs show-xs" >
            <thead id="table-detail-head-xs" >
            </thead>
            <tbody id="table-detail-body-xs" >
            </tbody>
          </table>
          {/* <table className="table table-dark table-bordered table-striped table-sm mt-1 table-consolidado-login table-scroll hidden-xs" >
            <thead>
              <tr>
                <th >Eventos</th>
                <th onClick={common.tableSort.bind(this, 'placement_date')} >Data</th>
                <th onClick={common.tableSort.bind(this, 'total_stake')} >Stake</th>
                <th onClick={common.tableSort.bind(this, 'total_return')} >Return</th>
                <th onClick={common.tableSort.bind(this, 'total')} >Total</th>
                <th onClick={common.tableSort.bind(this, 'odds')} >Odds</th>
                <th onClick={common.tableSort.bind(this, 'comissao')} >Com</th>
                <th onClick={common.tableSort.bind(this, 'data_betstatus')} >Status</th>
              </tr>
            </thead>
            <tbody>
              {this.state.details.map(x => <tr key={x.id}  >
                <td>
                  <div>
                    <b>{x.bet_confirmation.split('<br>')[x.bet_confirmation.split('<br>').length - 1]}</b>
                  </div>
                  <table className="table-detail w-100" >
                    <tbody dangerouslySetInnerHTML={{ __html: x.detail }}></tbody>
                  </table>
                </td>
                <td>{formatDate(x.placement_date, 'DD-MM-YY hh:mm:ss')}</td>
                <td>{x.total_stake}</td>
                <td>{x.total_return}</td>
                <td className={x.total < 0 ? 'green' : 'red'}>{x.total}</td>
                <td>{x.odds}</td>
                <td>{x.comissao}</td>
                <td className="text-center">{x.data_betstatus}</td>

              </tr>)}
            </tbody>
          </table> */}
          <div className="div-table-consolidado-login" >

            <table className="table table-dark table-bordered table-striped table-sm mt-1 table-consolidado-login table-scroll hidden-xs" >
              <thead>
                <tr>
                  <th id="th-bet" >Bet Details</th>
                  <th id="th-event">Event</th>
                  <th>EventDate</th>
                  <th>Status</th>
                  <th onClick={common.tableSort.bind(this, 'placement_date')} >Date</th>
                  <th onClick={common.tableSort.bind(this, 'total_return')} >Return</th>
                  <th onClick={common.tableSort.bind(this, 'total')} >Total</th>
                  <th onClick={common.tableSort.bind(this, 'odds')} >Odds</th>
                  <th onClick={common.tableSort.bind(this, 'data_betstatus')} >Enc</th>
                  <th onClick={common.tableSort.bind(this, 'comissao')} >Com</th>

                </tr>
              </thead>
              <tbody>
                {this.state.details.map(x => <tr key={x.id}  >
                  <td className="td-bet">{x.bet_confirmation.split('<br>').map((y, n) => <div title={y} id={'bet-' + x.id + '-' + n} onClick={this.divClick.bind(this, 'bet-' + x.id + '-' + n)} className="no-break font-sm overflow-x" key={n}>{y}</div>)}</td>
                  <td className="top td-event">{x.event_names.split(',').map((y, n) => <div title={y} id={'event-' + x.id + '-' + n} onClick={this.divClick.bind(this, 'event-' + x.id + '-' + n)} className="no-break font-sm" key={n}>{y}</div>)}</td>
                  <td className="top">{x.event_dates.split(',').map((x, n) => <div className="no-break font-sm" key={n}>{formatDate(x, 'DD-MM-YY')}</div>)}</td>
                  <td className="top">{x.event_results.split(',').map((x, n) => <div className="no-break font-sm" key={n}><span className={x.substring(0, 4) + '-Text'}>{x}</span></div>)}</td>
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
          <div className="div-consolidado-login-xs mt-1 show-xs" >
            {this.state.details.map(x => <table className="table table-dark table-bordered table-striped table-consolidado-login-xs table-sm  mb-1" key={x.id}  >
              <tbody>
                <tr className="row-consolidado-login-xs">
                  <th onClick={common.tableSort.bind(this, 'total_stake')} >Stake</th>
                  <th onClick={common.tableSort.bind(this, 'total_return')} >Return</th>
                  <th onClick={common.tableSort.bind(this, 'total')} >Total</th>
                  <th onClick={common.tableSort.bind(this, 'odds')} >Odds</th>
                  <th onClick={common.tableSort.bind(this, 'comissao')} >Com</th>
                </tr>
                <tr className="row-consolidado-login-xs">
                  <td>{x.total_stake}</td>
                  <td>{x.total_return}</td>
                  <td className={x.total < 0 ? 'green' : 'red'}>{x.total}</td>
                  <td>{x.odds}</td>
                  <td>{x.comissao}</td>
                </tr>
                <tr>
                  <td colSpan="5" >
                    <div>
                      <b className="text-white">{x.bet_confirmation.split('<br>')[x.bet_confirmation.split('<br>').length - 1]}</b> -
                      <span className="ml-1">{formatDate(x.placement_date, 'DD-MM-YY hh:mm:ss')}</span> -
                      <b className="ml-1">{x.data_betstatus == 0 ? 'Encerrado' : 'Aberto'}</b>
                    </div>
                    <table className="table-detail w-100" >
                      <tbody dangerouslySetInnerHTML={{ __html: x.detail }}></tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>)}
          </div>
        </div>
        <ReactTooltip />
      </React.Fragment>
    );
  }
}

export default withRouter(Bet);
