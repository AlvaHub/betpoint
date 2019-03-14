import React, { Component } from 'react'
import * as common from './Common';

class WeekSelector extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        let years = [];
        for (let index = new Date().getFullYear(); index >= 2017; index--) {
            years.push(index);
        }
        this.setState({ years });
        this.bindWeeks(years[0]);
    }
    bindWeeks(year) {
        this.props.show();
        common.getData('combo/consolidado-week/' + year).then((weeks) => {
            if (weeks.length === 0)
                this.setState({ weeks : [{id: "", name: "Nenhuma semana encontrada" }], week_id: "" });
            else
                this.setState({ weeks, week_id: weeks[0].id});

            this.props.weeksLoaded(weeks)
        });
    }
    state = {
        years: [],
        weeks: []
    }
    filterWeek = (e) => {
        this.setState({ week_id: e.target.value });
        this.props.weekChanged(e.target.value);
        setTimeout(() => { this.props.hideFilter() }, 1000);
    }
    filterYear = (e) => {

        this.setState({ year_id: e.target.value });
        this.bindWeeks(e.target.value)
    }
    changeWeek = (signal) => {

        let weekIndex = 0;
        for (let index = 0; index < this.state.weeks.length; index++) {
            if (this.state.weeks[index].id === this.state.week_id) {
                weekIndex = index + (1 * signal);
            }
        }
        if (weekIndex < 0 || weekIndex > this.state.weeks.length - 1)
            return;

        let week_id = this.state.weeks[weekIndex].id;
        this.setState({ week_id });
        this.props.weekChanged(week_id);

        setTimeout(() => { this.props.hideFilter() }, 1000);
    }
    render() {
        return (
            <React.Fragment>
                <div className="col-12 col-sm-2 p-1">
                    <select className="form-control form-control-sm" onChange={this.filterYear.bind(this)} value={this.state.year_id} >
                        {this.state.years.map((x, i) => <option key={i} value={x}>{x}</option>)}
                    </select>
                </div>
                <div className="col-12 col-sm-4 p-1">
                    <select className="form-control form-control-sm" onChange={this.filterWeek.bind(this)} value={this.state.week_id} >
                        {this.state.weeks.map((x, i) => <option key={i} value={x.id}>{x.name}</option>)}
                    </select>
                </div>
                <div className="col-12 col-sm-2 p-1 align-self-center text-center">
                    <i className="fas fa-arrow-left mr-4 text-secondary font-icon pointer" onClick={this.changeWeek.bind(this, 1)} ></i>
                    <i className="fas fa-arrow-right  text-secondary font-icon pointer" onClick={this.changeWeek.bind(this, -1)} ></i>
                </div>
            </React.Fragment>
        )
    }
}
export default WeekSelector
