import axios from 'axios';
const API = 'http://127.0.0.1:2379'

export default class Weather {
    static getAllWeather() {
        return axios(`${API}/weathers`)
    }

    static getNextWeather(location) {
        return axios({
            method: 'GET',
            url: `${API}/weather`,
            params: {
                location: location
            }
        })
    }

    static addWeather(location) {
        return axios({
            method: 'POST',
            url: `${API}/weather`,
            data: {
                location: location
            }
        });
    }

    static deleteWeather(location) {
        return axios({
            method: 'DELETE',
            url: `${API}/weather`,
            data: {
                location: location
            }
        });
    }
}