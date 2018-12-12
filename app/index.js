/**
 * Application entry point
 */

// Load application styles
import 'styles/index.scss';
import './svg-icons'
import './webslides'
import u from 'umbrellajs';
import Axios from 'axios';

// ================================
// START YOUR APP HERE
// ================================


var url = "https://votor-produktiv.azurewebsites.net/api/Votor/ac32db46-a1f1-47b1-4564-08d65ef4ba56/cac5b850-ff71-492e-a48d-12dace095df7"

// var response = { "id": "ac32db46-a1f1-47b1-4564-08d65ef4ba56", "userId": "cac5b850-ff71-492e-a48d-12dace095df7", "name": "Game Jam", "description": null, "startDate": "2018-12-11T07:03:40.7502147", "endDate": "2018-12-11T07:09:07.0545748", "public": false, "showOverallWinner": false, "votes": [{ "questionId": "3e40a0f0-7375-4e9c-27ae-08d65ef4be76", "question": "Bestes Game?", "choices": [{ "choiceId": "3608d54e-08a8-49c0-84ec-08d65f368cd9", "choice": "Color Trip", "score": 3.0 }, { "choiceId": "9e4f6beb-abc7-40ba-84ed-08d65f368cd9", "choice": "Battlefront 2", "score": 2.0 }] }] };

var votorResponse;
var ws;
Axios.get(url).then(function (response) {
    console.log(response);
    votorResponse = response.data;
    u("#votorTitle").html(votorResponse.name);

    votorResponse.votes.forEach(vote => {
        u('#webslides').append('<section class="bg-black aligncenter"><div class="wrap"><h2>'+
        vote.question +'</h2><div id="'+ vote.questionId+'" class="chart" style="height:700px; width: 1200px;"></div></div></section>')
    });

    ws = new WebSlides({
        autoslide: false,
        changeOnClick: true,
        loop: false,
        minWheelDelta: 40,
        navigateOnScroll: false,
        scrollWait: 450,
        slideOffset: 50,
        showIndex: false
    });
});


var echarts = require('echarts');

// initialize echarts instance with prepared DOM
var myChart;
// var myChart = echarts.init(document.getElementById('main'));
// var desc = ["Color Trip", "aaaa", "bbbb", "ccc", "ddd", "f", "g"]
// var loadedData = [60, 55, 30, 45, 5, 30, 10]
// var maxData = Math.max.apply(Math, loadedData);

document.getElementById("webslides").addEventListener('ws:slide-change', event => {
    // event.detail.slide contains the instance with all the methods and properties listed
    console.log(event)
    if(event.detail.currentSlide0 > 0) {
        var vote = votorResponse.votes[event.detail.currentSlide0 - 1]
        var data = [];
        var labels = [];
        vote.choices.forEach(choice => {
            data.push(choice.score);
            labels.push(choice.choice);
        });
        
        // resetChart(id);
        updateData(vote.questionId, data, labels);
    }
    // votorResponse.votes[event]
    // votorResponse.votes.forEach(vote => {
    //     console.log(vote);
    //     var data = [];
    //     var labels = [];
    //     vote.choices.forEach(choice => {
    //         data.push(choice.score);
    //         labels.push(choice.choice);
    //     });
        
    //     // resetChart(id);
    //     updateData(vote.questionId, data, labels);
    // });

    
});

// // draw chart
// myChart.setOption({
//     title: {
//         text: 'Best Game',
//         show: false
//     },
//     color: ['rgba(120, 187, 30, 0.8)'],
//     tooltip: {},
//     xAxis: {
//         data: desc,
//         nameTextStyle: {
//             color: ['#ff0000', 'rgba(123,123,123,0.5)'],
//             fontSize: 80
//         }
//     },
//     yAxis: {},
//     series: [{
//         name: 'Points',
//         type: 'bar',
//         data: loadedData,
//         animationEasing: 'linear',
//         animationDuration: function (idx) {
//             // delay for later data is larger
//             console.log((loadedData[idx] / maxData) * 5000);

//             return (loadedData[idx] / maxData) * 10000;
//         },
//         animationDelay: function (idx) {
//             // delay for later data is larger
//             return 0;
//         }
//     }]
// });

function updateData(id, freshData, labels) {
    console.log(id)
    console.log(document.getElementById(id))
    resetChart();
    myChart = echarts.init(document.getElementById(id));
    var maxData = Math.max.apply(Math, freshData);
    var newSeries = {
        title: {
            text: 'TEST',
            show: false
        },
        // textStyle: {
        //     color: ['rgba(0, 0, 0, 0.8)'],
        //     fontSize: 32,
        //     fontWeight: "bold"
        // },
        notMerge: true,
        color: ['rgba(120, 187, 30, 1)'],
        tooltip: {},
        legend: {
            show: false
        },
        xAxis: {
            data: labels,
            type: "category",
            // gridIndex: 3,
            axisLabel: {
                formatter: function(value, index) {
                  return value;
                },
                textStyle: {
                  color: '#000',
                  fontSize: 45,
                },
                rotate: 90,
                margin: 15,
                inside: true,
                verticalAlign: "center",
                fontFamily: 'Baloo Paaji',
                // align: "center",
              },
              z: 5
        },
        yAxis: {},
        series: [{
            name: 'Points',
            type: 'bar',
            data: freshData,
            scale: true,
            animationEasing: 'linear',
            animationDuration: function (idx) {
                console.log(freshData[idx] + " -> " + (freshData[idx] / maxData) * 20000);
                return (freshData[idx] / maxData) * 20000;
            },
            animationDelay: function (idx) {
                // delay for later data is larger
                return 1000;
            }
        }]
    };

    myChart.setOption(newSeries)
}

function resetChart(id) {
    if (myChart != null) {
        myChart.dispose();
    }
    // myChart = echarts.init(document.getElementById(id));
}

