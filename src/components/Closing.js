import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';
import ReactTooltip from 'react-tooltip';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import MomentLocaleUtils, { formatDate, parseDate } from 'react-day-picker/moment';
import 'moment/locale/pt-br';
import MyModal from './MyModal';


class Closing extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.barList();
  }
  barList() {
    this.props.changeTitle({
      left: null, center: <div className="pointer" onClick={this.bindList.bind(this)} >Fechamento</div>, right: <div className="" onClick={this.showFilter.bind(this)}><i className="fas fa-filter show-xs"></i></div>
    });
  }
  barForm = (title) => {
    this.props.changeTitle({
      left: <div className="btn-back" onClick={() => this.back()}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div>, center: title,
      right: <i className="fas fa-exchange-alt mr-2" onClick={() => { this.setState({ showModal: true, login_destination: "0" }); }}></i>
    });
  }
  back() {
    this.barList();
    document.getElementById('detail').className = 'form  pb-0 go';
    document.getElementById('list').className = '';
    document.getElementById('filter').className = 'filter hidden-xs';
    common.scrollLast();

  }
  viewDetail(item) {

  }
  componentDidMount() {
    this.bindList();
  }
  bindList() {
    this.props.show();
    var that = this;
    let date_from = formatDate(this.state.date_from, "YYYY-MM-DD");
    let date_to = formatDate(this.state.date_to, "YYYY-MM-DD");
    common.getData(`closing/${date_from}/${date_to}`).then((data) => {
      that.props.hide();
      let table = [];
      data.forEach(x => {
        let bookmakerRow = table.find(y => y && y.bookmaker === x.cliente);
        if (bookmakerRow == null)
          table.push({ bookmaker: x.cliente, rows: [x] });
        else
          bookmakerRow.rows.push(x);
      });
      this.setState({ items: data, itemsAll: data, table: table, tableAll: table })
    });
  }
  state = {
    itemsAll: [],
    items: [],
    details: [],
    date_from: this.getLastMonday(),
    date_to: new Date(this.getLastMonday()).addDays(6),
    betlogins: [],
    login_destination: "0",
    tableAll: [],
    table: [],
    view_type: "G"
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
    if (e.target.name == 'bet_selected_all') {
      let details = this.state.details;
      details.forEach(x => x.selected = e.target.checked ? 1 : 0);
      this.setState({ details })
      return;
    }
    else
      this.setState({ [e.target.name]: e.target.value })

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
              <select type="text" className="form-control form-control-sm" name="view_type" onChange={(e) => { this.setState({ view_type: e.target.value }) }} >
                <option value="G" >Geral</option>
                <option value="B" >Por Cliente</option>
              </select>
            </div>
            <div className="col-12 col-sm-2 p-1 align-self-center text-center">
              <i className="fas fa-arrow-left mr-4 text-secondary font-icon pointer" onClick={this.changeWeek.bind(this, -1)} ></i>
              <i className="fas fa-arrow-right  text-secondary font-icon pointer" onClick={this.changeWeek.bind(this, 1)} ></i>
            </div>
          </div>
        </div>
        <div className="margin-top-filter margin-top-filter-xs" ></div>
        <div id="list">
          <div className="div-table-closing div-table-closing-xs" >
            {this.state.view_type == "G" ?
              <table className="table table-dark table-bordered  table-sm table-closing-md table-closing-xs" >
                {/* <thead className="hidden-xs">
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
                  </tr>
                </thead> */}
                <tbody>
                  {this.state.table.map((t, n) => <tr key={n}   >
                    <td colSpan="9" style={{ padding: 0, margin: 0 }}>
                      <div className="bookmaker-title">
                        <b>{t.bookmaker}</b>
                      </div>
                      <table className="table table-closing">
                        <tbody>
                          <tr>
                            <td colSpan="9" className="td-total">
                              <b className="ml-2">Parcial:</b> {t.rows.sum('parcial', true, ['red', 'yellow', 'green-dark'])}
                              <b className="ml-2">Comissão:</b> {t.rows.sum('comissao', true, ['red', 'yellow', 'green-dark'])}
                              <div className="block-inline no-break" >
                                <b className="ml-2">Total:</b> {common.formatNumber(t.rows.sumNoFormat('parcial') + t.rows.sumNoFormat('comissao'), true, ['red', 'yellow', 'green-dark'])}
                              </div>
                            </td>
                          </tr>
                          <tr className="hidden-xs">
                            <th>Conta</th>
                            <th>Cliente</th>
                            <th>Qtd</th>
                            <th>Volume</th>
                            <th>Vale</th>
                            <th>Atual</th>
                            <th >Pend</th>
                            <th>uM</th>
                            <th>Parcial</th>
                          </tr>
                          {t.rows.map((x, i) => <tr key={i} >
                            <td className="hidden-xs">{x.conta}</td>
                            <td className="hidden-xs">{x.cliente}</td>
                            <td className="hidden-xs">{x.qtd}</td>
                            <td className="hidden-xs" >{common.formatNumber(x.volume, true)}</td>
                            <td className="hidden-xs">{x.vale}</td>
                            <td className="hidden-xs">{x.atual}</td>
                            <td className="hidden-xs">{x.pendente}</td>
                            <td className="hidden-xs">{x.um}</td>
                            <td className="hidden-xs">{common.formatNumber(x.parcial, true)}</td>
                            <td colSpan="9" className="show-xs">
                              <div className="font-lg font-weight-bold" >{x.conta}</div>
                              <div className="row no-gutters labels-xs">
                                <div className="col-6"><b>Qtd: </b> {x.qtd}</div>
                                <div className="col-6"><b>Volume: </b> {common.formatNumber(x.volume, true)}</div>
                                <div className="col-6"> <b>Vale: </b> {x.vale}</div>
                                <div className="col-6"><b>Atual: </b> {x.atual}</div>
                                <div className="col-6"><b>Pendente: </b> {x.pendente}</div>
                                <div className="col-6"><b>uM: </b> {x.um}</div>
                                <div className="col-6"><b>Parcial: </b> {common.formatNumber(x.parcial, true)}</div>
                              </div>
                            </td>
                          </tr>
                          )}

                        </tbody>
                      </table>
                    </td>
                  </tr>)}
                </tbody>
              </table>
              : null}
          </div>
          {this.state.view_type == "B" ?
            <table className="table table-dark table-bordered table-striped table-sm table-closing-bookmaker table-scroll" >
              <thead >
                <tr>
                  <th onClick={common.tableSort.bind(this, 'conta')} >Conta</th>
                  <th onClick={common.tableSort.bind(this, 'cliente')} >Total</th>
                </tr>
              </thead>
              <tbody>
                {this.state.table.map((t, n) => <tr key={n} >
                  <td>{t.bookmaker}</td>
                  <td>{common.formatNumber(t.rows.sumNoFormat('parcial') + t.rows.sumNoFormat('comissao'), true)}</td>
                </tr>
                )}
              </tbody>
            </table> : null}
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(Closing);
