import React from 'react'

var lastScroll = 0;

export var api_url = (window.location.hostname === 'localhost' ? 'http://betpoint:8001/api/' : 'https://natansports.websiteseguro.com/api/');

function scrollTop() {
    lastScroll = window.scrollY;
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 1)
}
function scrollLast() {
    setTimeout(() => {
        window.scrollTo(0, lastScroll);
    }, 1)
}
function getData(path) {
    return fetch(api_url + path).then(data => data.json());
}
function postData(path, dataInput) {
    return fetch(api_url + path, {
        method: 'post', body: JSON.stringify(dataInput)
    }).then(data => data.json());
}
export function tableSort(key, obj) {

    let direction = this.state.sortField === key ? 1 : -1;
    if (typeof (obj) !== 'string') {
        let data = this.state.items.sort((a, b) => {
            if (a[key] < b[key]) return 1 * direction;
            if (a[key] > b[key]) return -1 * direction;
            return 0;
        });
        this.setState({ items: data, sortField: (key === this.state.sortField ? '' : key) });
    }
    else {
        let data = this.state[obj].sort((a, b) => {
            if (a[key] < b[key]) return 1 * direction;
            if (a[key] > b[key]) return -1 * direction;
            return 0;
        });
        this.setState({ [obj]: data, sortField: (key === this.state.sortField ? '' : key) });
    }
}
export function tableSortNumber(key, obj) {

    if (typeof (obj) !== 'string') {
        let data = this.state.sortField === key ?
            this.state.items.sort((a, b) => b[key] - a[key]) :
            this.state.items.sort((a, b) => a[key] - b[key]);
        this.setState({ items: data, sortField: (key === this.state.sortField ? '' : key) });
    }
    else {
        if (typeof (key) !== 'object') {
            let data = this.state.sortField === key ?
                this.state[obj].sort((a, b) => (b[key] || 0) - (a[key] || 0)) :
                this.state[obj].sort((a, b) => (a[key] || 0) - (b[key] || 0));
            this.setState({ [obj]: data, sortField: (key === this.state.sortField ? '' : key) });
        }
        else {
            let data = this.state.sortField === key[1] ?
                this.state[obj].sort((a, b) => (b[key[0]] ? b[key[0]][key[1]] : 0) - (a[key[0]] ? a[key[0]][key[1]] : 0)) :
                this.state[obj].sort((a, b) => (a[key[0]] ?  a[key[0]][key[1]] : 0) - (b[key[0]] ? b[key[0]][key[1]]  : 0));
            this.setState({ [obj]: data, sortField: (key[1] === this.state.sortField ? '' : key[1]) });
        }
    }

}
export function hideMore() {

    document.body.className = "";
    document.getElementById('menu-more').className = 'menu-more';
    document.body.removeEventListener('click', hideMore);
}
export function setUser(user) {
    localStorage.setItem("user", JSON.stringify(user))
}
export function getUser() {
    var user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}
Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
export function newButton() {
    return <i className="fas fa-edit mr-2"></i>
}
export function formatNumber(x, color, colors) {
    if (x == null || isNaN(x)) return "";
    var parts = x.toString().split(".");
    if (parts.length == 1)
        parts.push("00");
    if (parts[1].length > 2)
        parts[1] = parts[1].substring(0, 2);
    if (parts[1].length == 1)
        parts[1] += "0";

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (color) {
        if (!colors)
            return <span className={Number(x) == 0 ? "yellow" : Number(x) < 0 ? 'red' : 'green'} >{parts.join(",")}</span>;
        else
            return <span className={Number(x) == 0 ? colors[1] : Number(x) < 0 ? colors[0] : colors[2]} >{parts.join(",")}</span>;
    }
    return parts.join(",");
}
export function closeModal() {
    this.setState({ showModal: false });
}
export function num(value) {
    if (value != null) {
        return Number(value.toString().replace(/\./g, '').replace(',', '.'));
    }
    return 0;
}
Array.prototype.sum = function (prop, color, colors) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += isNaN(this[i][prop]) ? 0 : Number(this[i][prop]);
    }
    return formatNumber(total, color, colors);
}
Array.prototype.sumNoFormat = function (prop, color) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += isNaN(this[i][prop]) ? 0 : Number(this[i][prop]);
    }
    return total
}
Array.prototype.sumString = function (prop, color) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
        let value = num(this[i][prop]);
        total += isNaN(value) ? 0 : Number(value);
    }
    return formatNumber(total, color);
}
Array.prototype.sumWithComma = function (prop, color) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
        let numbers = this[i][prop].split(',');
        numbers.forEach(x => {
            total += isNaN(x) ? 0 : Number(x);
        });
    }
    return formatNumber(total, color);
}
Array.prototype.sumInt = function (prop) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += isNaN(this[i][prop]) ? 0 : Number(this[i][prop]);
    }
    return total;
}
export function setTheme() {
    if (getUser().theme == null) return;
    if (document.getElementById('theme-light') != null) return;
    let link = document.createElement('link');
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = "/light.css";
    link.id = "theme-light";
    document.head.appendChild(link);
}
export { scrollTop, scrollLast, getData, postData } 
