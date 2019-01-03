var lastScroll = 0;

export var api_url = (window.location.hostname === 'localhost' ? 'http://betpoint:8001/api/' : 'https://betpoint.websiteseguro.com/api/');

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
export function tableSort(key) {

    let direction = this.state.sortField === key ? 1 : -1;

    let data = this.state.items.sort((a, b) => {
        if (a[key] < b[key]) return 1 * direction;
        if (a[key] > b[key]) return -1 * direction;
        return 0;
    });
    this.setState({ items: data, sortField: (key === this.state.sortField ? '' : key) });
}
export function tableSortNumber(key) {

    let data = this.state.sortField === key ? 
    this.state.items.sort((a, b) =>  b[key] - a[key]) :
    this.state.items.sort((a, b) =>  a[key] - b[key]) ;

    this.setState({ items: data, sortField: (key === this.state.sortField ? '' : key) });
}
export function hideMore() {
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
export { scrollTop, scrollLast, getData, postData } 
