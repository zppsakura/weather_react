import React, { Component } from 'react';
import './App.css';
import BMap from 'BMap';
import qs from 'qs';
import { Input, message, Modal, Table, Tag } from 'antd';
import '../static/css/layout.css';
import Weather from './services/weather';

const { Search } = Input;
const { confirm } = Modal;


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mapData: [],
            dailyForecast: [],
            map: null,
            visible: false,
            confirmShow: false,
            cityValue: ''
        };
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = e => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    handleCancel = e => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };


    componentDidMount() {
        this.getAllWeather()

    }
    getAllWeather() {
        Weather.getAllWeather().then((res) => {
            if (res.data.data) {
                this.setState({
                    mapData: res.data.data
                }, () => {
                    this.getWeatherMap()
                })
            } else {
                this.getWeatherMap()
            }
        })
    }
    getWeatherMap() {
        const map = new BMap.Map('container', { enableMapClick: false });
        map.enableScrollWheelZoom();
        const locationFocus = this.state.mapData[this.state.mapData.length - 1].basic
        if (locationFocus) {
            var point = new BMap.Point(locationFocus.lon, locationFocus.lat);
            map.centerAndZoom(point, 10);
        } else {
            var point = new BMap.Point(118.850, 31.953);
            map.centerAndZoom(point, 10);
        }

        this.state.mapData.map(item => {
            const marker = new BMap.Marker(new BMap.Point(item.basic.lon, item.basic.lat))
            map.addOverlay(marker);
            const point = new BMap.Point(item.basic.lon, item.basic.lat);
            marker.addEventListener("mouseover", () => {
                if (item.now) {
                    var opts = {
                        width: 250,     // 信息窗口宽度    
                        height: 150,     // 信息窗口高度    
                        title: `${item.basic.admin_area} - ${item.basic.parent_city} - ${item.basic.location}的当前天气为`  // 信息窗口标题   
                    }
                    var infoWindow = new BMap.InfoWindow(`
                温度： ${item.now.tmp}℃</br>
                体感温度： ${item.now.fl}℃ </br>
                天气： ${item.now.cond_txt}</br>
                风向： ${item.now.wind_dir}</br>
                相对湿度： ${item.now.hum}</br>
                降水量： ${item.now.pcpn}</br>
                `, opts);  // 创建信息窗口对象    
                    map.openInfoWindow(infoWindow, point);
                }

            });
            marker.addEventListener("rightclick", () => {
                const that = this;
                if (item.now) {
                    var opts = {
                        width: 250,     // 信息窗口宽度    
                        height: 150,     // 信息窗口高度    
                        title: `${item.basic.admin_area} - ${item.basic.parent_city} - ${item.basic.location}的当前天气为`  // 信息窗口标题   
                    }
                    var infoWindow = new BMap.InfoWindow(`
                温度： ${item.now.tmp}℃</br>
                体感温度： ${item.now.fl}℃ </br>
                天气： ${item.now.cond_txt}</br>
                风向： ${item.now.wind_dir}</br>
                相对湿度： ${item.now.hum}</br>
                降水量： ${item.now.pcpn}</br>

                `, opts);  // 创建信息窗口对象    
                    map.closeInfoWindow(infoWindow, point);
                    confirm({
                        title: `你确定要删除${item.basic.admin_area} - ${item.basic.parent_city} - ${item.basic.location}的天气吗?`,
                        onOk() {
                            Weather.deleteWeather(item.basic.location).then(res => {
                                if (res.data.code === 0) {
                                    message.success(res.data.msg);
                                    that.getAllWeather()
                                } else {
                                    message.error(res.data.msg);
                                }
                            })
                        },
                        onCancel() { },
                    });
                }
            });
            marker.addEventListener("click", () => {
                if (item.now) {
                    var opts = {
                        width: 250,     // 信息窗口宽度    
                        height: 150,     // 信息窗口高度    
                        title: `${item.basic.admin_area} - ${item.basic.parent_city} - ${item.basic.location}的当前天气为`  // 信息窗口标题   
                    }
                    var infoWindow = new BMap.InfoWindow(`
                    温度： ${item.now.tmp}℃</br>
                    体感温度： ${item.now.fl}℃ </br>
                    天气： ${item.now.cond_txt}</br>
                    风向： ${item.now.wind_dir}</br>
                    相对湿度： ${item.now.hum}</br>
                    降水量： ${item.now.pcpn}</br>
    
                    `, opts);  // 创建信息窗口对象 
                    map.closeInfoWindow(infoWindow, point);
                    Weather.getNextWeather(item.basic.location).then(res => {
                        this.setState({
                            dailyForecast: res.data.data.daily_forecast
                        }, () => {
                            this.setState({
                                visible: true
                            })
                        })
                    })

                }

            });
        })
    }
    handleChange = (e) => {
        this.setState({
            cityValue: e.target.value
        })
    }
    handleSearch(value) {
        Weather.addWeather(value).then(res => {
            this.setState({
                cityValue: ''
            })
            if (res.data.code === 0) {
                message.success(res.data.msg);
                this.getAllWeather()

            } else if (res.data.code === 1) {
                message.error('该城市不存在，请重新搜索')
            }
        })
    }
    render() {
        const columns = [
            {
                dataIndex: 'date',
                render: (text, record) => {
                    return (
                        <span>{record.date}</span>
                    )
                }
            },
            {
                title: '温度',
                dataIndex: 'tmp_max',
                render: (text, record) => {
                    return (
                        <span>
                            <span>{record.tmp_max}℃</span> / <span>{record.tmp_min}℃</span>
                        </span>
                    )
                }
            },
            {
                title: '白天天气情况',
                dataIndex: 'cond_txt_d',
                render: (text, record) => (
                    <span>
                        {
                            record.cond_txt_d == '多云' ? <Tag color="blue">{record.cond_txt_d}</Tag> : record.cond_txt_d == '晴' ? <Tag color="red">{record.cond_txt_d}</Tag> : <Tag color="green">{record.cond_txt_d}</Tag>
                        }
                    </span>
                ),
            },
            {
                title: '夜晚天气情况',
                dataIndex: 'cond_txt_n',
                render: (text, record) => (
                    <span>
                        {
                            record.cond_txt_n == '多云' ? <Tag color="blue">{record.cond_txt_n}</Tag> : record.cond_txt_n == '晴' ? <Tag color="red">{record.cond_txt_n}</Tag> : <Tag color="green">{record.cond_txt_n}</Tag>
                        }
                    </span>
                ),
            },
            {
                title: '降雨概率',
                dataIndex: 'pop',
                render: (text, record) => {
                    return (
                        <span>{record.pop}%</span>
                    )
                }
            },
            {
                title: '风向',
                dataIndex: 'wind_dir',
                render: (text, record) => {
                    return (
                        <span>{record.wind_dir}</span>
                    )
                }
            },
            {
                title: '日出日落',
                dataIndex: 'sr',
                render: (text, record) => {
                    return (
                        <span>
                            <span>{record.sr}</span> / <span>{record.ss}</span>
                        </span>
                    )
                }
            },
            {
                title: '能见度',
                dataIndex: 'vis',
                render: (text, record) => {
                    return (
                        <span>{record.vis}公里</span>
                    )
                }
            },

        ];
        return (
            <div className="App">
                <Search
                    placeholder="请输入城市名"
                    value={this.state.cityValue}
                    onSearch={(value) => this.handleSearch(value)}
                    onChange={this.handleChange}
                    enterButton
                    size="large"
                    style={{ width: '60%', marginTop: '20px' }}
                />
                <div id="container"></div>
                <Modal
                    visible={this.state.visible}
                    closable={false}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={700}
                >
                    <Table columns={columns} dataSource={this.state.dailyForecast} pagination={false} />
                </Modal>

            </div>
        );
    }
}

export default App;
