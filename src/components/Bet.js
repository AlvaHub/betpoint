import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import DateCombo from './DateCombo'
import CurrencyFormat from 'react-currency-format';
import * as common from './Common';
import ReactTooltip from 'react-tooltip';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import DayPicker from 'react-day-picker/DayPicker';
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
    this.props.changeTitle({ left: <div><i className="fas fa-futbol"></i> HULK BET</div>, center: 'Consolidado', right: <button type="button" onClick={() => this.newData()} className="btn-right">Novo</button> });
  }
  barForm = (title) => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={() => this.back()}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div>, center: title });
  }
  back() {
    this.barList();
    document.getElementById('detail').className = 'form  pb-0 go';
    document.getElementById('list').className = '';
    document.getElementById('filter').className = 'filter';
    common.scrollLast();

  }
  newData() {
    common.scrollTop();
    this.setState({ data: this.getNewData() });
    document.getElementById('new').className = 'form  pb-0 come';
    document.getElementById('list').className = 'hidden';
    document.getElementById('filter').className = 'hidden';
    this.barForm();


  }
  viewDetail(item) {
    this.props.show();

    //Copy Header of selected item to show on detail screen
    document.getElementById("table-detail-head").innerHTML = document.getElementById("table-consolidado-head").outerHTML;
    document.getElementById("table-detail-head-xs").innerHTML = document.getElementById("table-consolidado-head-xs").outerHTML;

    //Copy Row of selected item on detail screen
    document.getElementById("table-detail-body").innerHTML = document.getElementById(item.conta).outerHTML;
    document.getElementById("table-detail-body-xs").innerHTML = document.getElementById(item.conta + '-xs').outerHTML;

    common.getData('detail-by-login/' + item.conta).then((data) => {
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
    common.getData(`get-by-date/${date_from}/${date_to}`).then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) });
  }
  componentDidMount() {

    //Get list
    this.bindList();
    // common.getData('flight-types').then((data) => { this.setState({ flightTypes: data }) });
    // common.getData('combo/passenger').then((data) => { this.setState({ passengers: data }) });
    // common.getData('combo/crew').then((data) => { this.setState({ crew: data }) });

    
  }
  state = {
    itemsAll: [],
    items: [],
    details: [],
    date_to : new Date(),
    date_from : new Date().setDate(new Date().getDate() - 7),
  }
  getNewData() {

    return {
      id: 0,
      passenger: 0,
      passengers: [],
      crew_index: 0,
      crew: this.state ? this.state.crew : [],
      date_start: new Date(),
      type_id: 'JR',
      description: '',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
    }
  }
  handleChange = e => {
    console.log(e);
    // let data = this.state.data;
    // data[e.target.name] = e.target.value;
    // this.setState({ data })

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
  addPassenger() {
    let data = this.state.data;
    let newItem = this.state.passengers[this.state.data.passenger];
    let p = data.passengers.filter(x => { return parseInt(x.id) === parseInt(newItem.id) });

    if (p.length > 0) return alert('Este passageiro já foi adicionado!')
    data.passengers.push(newItem);
    this.setState({ data });
  }
  removePassenger(id) {
    let data = this.state.data;
    for (let i = 0; i < data.passengers.length; i++) {
      if (data.passengers[i].id == id) {
        data.passengers.splice(i, 1);
        break;
      }
    }
    this.setState({ data });
  }
  openPanel(id) {
    document.getElementById(id).style.display = 'block';
    document.getElementById(id).className = 'panel panel-come';

    setTimeout(() => {
      if (document.getElementById(id) != null)
        document.getElementById(id).className = 'panel panel-go';
    }, 3000);
  }
  filter(e) {
    let items = [];
    if (e.target.value == '')
      items = this.state.itemsAll;
    else {
      let value = e.target.value.toUpperCase();
      items = this.state.itemsAll.filter(x =>
        (x.conta.toUpperCase() + "").indexOf(value) >= 0);
    }

    this.setState({ items });
  }
  formatDecimal = (x) => {
    var parts = x.toString().split(".");
    if (parts.length == 1)
      parts.push("00");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
  }
  handleDayChange(selectedDay, modifiers, dayPickerInput) {
    this.setState({[dayPickerInput.props.name] : selectedDay})

    setTimeout(() => {
     this.bindList();
    }, 1);
   
  }

  render() {
    return (
      <React.Fragment>
        <div className="filter" id="filter" >
          <div className="row no-gutters" >
            <div className=" col-sm-6 p-1">
              <input type="text" className="form-control form-control-sm" placeholder="Buscar..." onChange={this.filter.bind(this)} />
            </div>
            <div className="col-6 col-sm-3 p-1">
            <DayPickerInput name="date_from"
                placeholder={formatDate(this.state.date_from, 'DD/MM/YYYY')} onDayChange={this.handleDayChange.bind(this)} parseDate={parseDate} formatDate={formatDate}
                dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{readOnly: true}} />
            </div>
            <div className="col-6 col-sm-3 p-1 date-to">
              <DayPickerInput name="date_to"
                placeholder={formatDate(this.state.date_to, 'DD/MM/YYYY')} onDayChange={this.handleDayChange.bind(this)} parseDate={parseDate} formatDate={formatDate}
                dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{readOnly: true}} />
            </div>
          </div>
        </div>
        <div className="div-table" ></div>

        <div id="list">
          <table className="table table-dark table-hover table-bordered table-striped table-sm hidden-xs page-margin-bottom" >
            <thead id="table-consolidado-head" >
              <tr>
                <th onClick={common.tableSort.bind(this, 'conta')} >Conta</th>
                <th onClick={common.tableSort.bind(this, 'cliente')} >Cliente</th>
                <th onClick={common.tableSort.bind(this, 'qtd')} >Qtd</th>
                <th onClick={common.tableSort.bind(this, 'volume')} >Volume</th>
                <th onClick={common.tableSort.bind(this, 'vale')} >Vale</th>
                <th onClick={common.tableSort.bind(this, 'atual')} >Atual</th>
                <th onClick={common.tableSort.bind(this, 'pendente')} >Pendente</th>
                <th onClick={common.tableSort.bind(this, 'um')} >uM</th>
                <th onClick={common.tableSort.bind(this, 'parcial')} >Parcial</th>
                <th onClick={common.tableSort.bind(this, 'comissão')} >Comissão</th>
                <th onClick={common.tableSort.bind(this, 'total')} >Total</th>
                <th onClick={common.tableSort.bind(this, 'profit_percent')} >%</th>
                <th onClick={common.tableSort.bind(this, 'resultado')} >Resultado</th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map(x => <tr key={x.conta} id={x.conta} onClick={this.viewDetail.bind(this, x)} >
                <td>{x.conta}</td>
                <td>{x.cliente}</td>
                <td>{x.qtd}</td>
                <td className={x.volume == 0 ? "yellow" : x.volume < 0 ? 'red' : 'green'} >{this.formatDecimal(x.volume)}</td>
                <td>{x.vale}</td>
                <td>{x.atual}</td>
                <td>{x.pendente}</td>
                <td>{x.um}</td>
                <td>{this.formatDecimal(x.parcial)}</td>
                <td>{x.comissão}</td>
                <td className={x.total == 0 ? "yellow" : x.total < 0 ? 'red' : 'green'} >{this.formatDecimal(x.total)}</td>
                <td>{x.profit_percent}</td>
                <td className={x.resultado == 0 ? "" : x.resultado < 0 ? 'red' : 'green'} >{this.formatDecimal(x.resultado)}</td>
              </tr>)}
            </tbody>
          </table>
          <table className="table table-dark table-hover table-bordered table-striped table-sm show-xs table-consolidado-xs table-scroll" >
            <thead id="table-consolidado-head-xs">
              <tr>
                <th>
                  <div className="row no-gutters" >
                    <div className="col-3" onClick={common.tableSort.bind(this, 'volume')} >Vol</div>
                    <div className="col-3" onClick={common.tableSort.bind(this, 'vale')} >Vale</div>
                    <div className="col-3" onClick={common.tableSort.bind(this, 'atual')} >Atual</div>
                    <div className="col-3" onClick={common.tableSort.bind(this, 'pendente')} >Pend</div>
                    <div className="w-100" ></div>
                    <div className="col-3" onClick={common.tableSort.bind(this, 'parcial')} >Parc</div>
                    <div className="col-3" onClick={common.tableSort.bind(this, 'comissão')} >Com</div>
                    <div className="col-3" onClick={common.tableSort.bind(this, 'total')} >Tot</div>
                    <div className="col-3" onClick={common.tableSort.bind(this, 'resultado')} >Res</div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map(x => <tr key={x.conta} id={x.conta + '-xs'} onClick={this.viewDetail.bind(this, x)} >
                <td>
                  <div className="row no-gutters" >
                    <div className="col-12 text-left pl-1" ><b>{x.conta} - {x.cliente} - {x.um} - {x.profit_percent}% - {x.qtd}</b></div>
                    {/* <div className="col-6" >
                      <b className="ml-1 text-success">Qtd</b> {x.qtd}
                      <b className="ml-1 text-warning">UM</b> {x.um}
                      <b className="ml-1 text-info">%</b> {x.profit_percent}
                     </div> */}
                    <div className="w-100" ></div>
                    <div className={x.volume == 0 ? "col-3 yellow" : x.volume < 0 ? 'col-3 red' : 'col-3 green'} >{this.formatDecimal(x.volume)}</div>
                    <div className="col-3" >{x.vale}</div>
                    <div className="col-3">{x.atual}</div>
                    <div className="col-3">{x.pendente}</div>
                    <div className="w-100" ></div>
                    <div className="col-3">{this.formatDecimal(x.parcial)}</div>
                    <div className="col-3">{x.comissão}</div>
                    <div className={x.total == 0 ? "col-3 yellow" : x.total < 0 ? 'col-3 red' : 'col-3 green'} >{this.formatDecimal(x.total)}</div>
                    <div className={x.resultado == 0 ? "col-3" : x.resultado < 0 ? 'col-3 red' : 'col-3 green'} >{this.formatDecimal(x.resultado)}</div>
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
          <table className="table table-dark table-bordered table-striped table-sm mt-1 table-consolidado-login table-scroll hidden-xs" >
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
                <td>{x.placement_date}</td>
                <td>{x.total_stake}</td>
                <td>{x.total_return}</td>
                <td className={x.total < 0 ? 'green' : 'red'}>{x.total}</td>
                <td>{x.odds}</td>
                <td>{x.comissao}</td>
                <td className="text-center">{x.data_betstatus}</td>

              </tr>)}
            </tbody>
          </table>
          <table className="table table-dark table-bordered table-striped table-consolidado-login-xs table-sm mt-1 table-scroll show-xs" >
            <thead>
              <tr className="row-consolidado-login-xs">
                <th onClick={common.tableSort.bind(this, 'total_stake')} >Stake</th>
                <th onClick={common.tableSort.bind(this, 'total_return')} >Return</th>
                <th onClick={common.tableSort.bind(this, 'total')} >Total</th>
                <th onClick={common.tableSort.bind(this, 'odds')} >Odds</th>
                <th onClick={common.tableSort.bind(this, 'comissao')} >Com</th>
              </tr>
            </thead>
            <tbody>
              {this.state.details.map(x => <React.Fragment key={x.id}  >
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
                      <b className="ml-1">Data:</b> {x.placement_date}
                      <b className="ml-1">Status:</b> {x.data_betstatus}
                    </div>
                    <table className="table-detail w-100" >
                      <tbody dangerouslySetInnerHTML={{ __html: x.detail }}></tbody>
                    </table>
                  </td>
                </tr>
              </React.Fragment>)}
            </tbody>
          </table>
        </div>
        <ReactTooltip />
      </React.Fragment>
    );
  }
}

export default withRouter(Bet);
