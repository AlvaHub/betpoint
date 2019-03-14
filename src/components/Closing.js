import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';
import WeekSelector from './WeekSelector';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import MomentLocaleUtils, { formatDate, parseDate } from 'react-day-picker/moment';
import 'moment/locale/pt-br';

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
  componentDidMount() {

  }

  state = {
    itemsAll: [],
    items: [],
    details: [],
    betlogins: [],
    login_destination: "0",
    tableAll: [],
    table: [],
    view_type: "G"
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
  weeksLoaded(weeks) {

    this.props.show();

    if (weeks.length === 0) {
      this.setState({ week_id: null, items: [], itemsAll: [], tables: [] });
      this.props.hide();
      return;
    }
    this.weekChanged(weeks[0].id)
  }
  weekChanged(week_id) {
    this.bindList(week_id);
  }
  bindList(week_id) {
    week_id = week_id ? week_id : this.state.week_id;
    this.props.show();
    var that = this;
    let date_from = week_id.split('|')[0];
    let date_to = week_id.split('|')[1];

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
      //For each bookmaker set Total Parcial, Total Comission
      table.forEach(x => {
        x.rows.push({ um: 'Parcial', parcial: x.rows.sumNoFormat('parcial'), sum_total: true });
        x.rows.push({ um: 'Comissão', parcial: x.rows.sumNoFormat('comissao'), sum_total: true });
        //Get All logins where this bookmaker has distribution
        let rowsWithDistribution = data.filter(y => y.distribution && y.distribution.indexOf(x.bookmaker) >= 0);
        if(x.bookmaker === "Edelson"){
          console.log(rowsWithDistribution);
        }
        //Bet the distribution amount for each login
        rowsWithDistribution.forEach(y => {
          y.distribution.split(',').forEach(r => {
            let bookmaker = r.split(':')[0].trim();
            if (bookmaker === x.bookmaker) {
              let amount = Math.abs(Number(y.parcial) * (parseInt(r.split(':')[1]) / 100));
              x.rows.push({ um: parseInt(r.split(':')[1]) + "% " + y.conta, parcial: amount, sum_total: true });
            }
          });
        });
        //Set the Total of Parcial + Commission + Distribution
        x.rows.push({ um: 'Total', parcial: x.rows.filter(y => y.sum_total).sumNoFormat('parcial'), sum_total: true });

      })
      this.setState({ items: data, itemsAll: data, table: table, tableAll: table })
    });
  }


  render() {

    return (
      <React.Fragment>
        <div className="filter hidden-xs" id="filter">
          <div className="row no-gutters" >
            <div className="col-12 col-sm-2 p-1">
              <input type="text" className="form-control form-control-sm" placeholder="Buscar..." onChange={this.filter.bind(this)} />
            </div>
            <div className="col-12 col-sm-2 p-1">
              <select type="text" className="form-control form-control-sm" name="view_type" onChange={(e) => { this.setState({ view_type: e.target.value }) }} >
                <option value="G" >Geral</option>
                <option value="B" >Por Cliente</option>
              </select>
            </div>
            <WeekSelector weeksLoaded={this.weeksLoaded.bind(this)} weekChanged={this.weekChanged.bind(this)} hideFilter={this.hideFilter.bind(this)} show={this.props.show} />
          </div>
        </div>
        <div className="margin-top-filter margin-top-filter-xs" ></div>
        <div id="list">
          <div className="div-table-closing div-table-closing-xs" >
            {this.state.view_type == "G" ?
              <React.Fragment>
                {this.state.table.map((t, n) => <table key={n} className="table table-sm table-closing-md table-closing-xs mb-1" >
                  <tbody>
                    <tr>
                      <td colSpan="9" style={{ padding: 0, margin: 0 }}>
                        <div className={n % 2 === 0 ? 'bookmaker-title' : 'bookmaker-title-alternate'}>
                          <b>{t.bookmaker}</b>
                        </div>
                        <table className="table table-closing">
                          <tbody>
                            <tr>
                              {/* <td colSpan="9" className="td-total">
                              <b className="ml-2">Parcial:</b> {t.rows.sum('parcial', true, ['red', 'yellow', 'green-dark'])}
                              <b className="ml-2">Comissão:</b> {t.rows.sum('comissao', true, ['red', 'yellow', 'green-dark'])}
                              <div className="block-inline no-break" >
                                <b className="ml-2">Total:</b> {common.formatNumber(t.rows.sumNoFormat('parcial') + t.rows.sumNoFormat('comissao'), true, ['red', 'yellow', 'green-dark'])}
                              </div>
                            </td> */}
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
                            {t.rows.map((x, i) => <tr key={i} className={(x.sum_total ? 'tr-total' : '')} >
                              <td className="hidden-xs">{x.conta}</td>
                              <td className="hidden-xs">{x.cliente}</td>
                              <td className="hidden-xs">{x.qtd}</td>
                              <td className="hidden-xs" >{common.formatNumber(x.volume, true)}</td>
                              <td className="hidden-xs">{x.vale}</td>
                              <td className="hidden-xs">{x.atual}</td>
                              <td className="hidden-xs">{x.pendente}</td>
                              <td className={'hidden-xs '}>{x.um}</td>
                              <td className={'hidden-xs '}>{common.formatNumber(x.parcial, true)}</td>
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
                    </tr>
                  </tbody>
                </table>)}
              </React.Fragment>
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
