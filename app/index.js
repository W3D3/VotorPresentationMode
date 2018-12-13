/**
 * Application entry point
 */

import 'styles/index.scss';
import './svg-icons'
import './webslides'
import u from 'umbrellajs';
import Axios from 'axios';
import anime from 'animejs'
import echarts from 'echarts'
var url;
var votorResponse;
var ws;
// var echarts = require('echarts');

u("#start").on('click', e => {
    console.log(u("#apiURL"))
    url = u("#apiURL").first().value;
    console.log(url)

    Axios.get(url).then(function (response) {
        console.log(response);
        votorResponse = response.data;
        u("#votorTitle").html(votorResponse.name);

        votorResponse.votes.forEach(vote => {
            u('#webslides').append('<section class="aligncenter nopad"><div class="wrap"><h1>' +
                vote.question + '</h1><div id="' + vote.questionId + '" class="chart" style="height:800px; width: 1200px;"></div></div></section>')
        });
        votorResponse.votes.forEach(vote => {
            u('#webslides').append('<section class="aligncenter winner"><div class="wrap"><h2>Winner of '+ vote.question +'</h2><h1>WinnerName</h1></div><canvas class="fireworks"></canvas></section>')
        });

        ws = new WebSlides({
            autoslide: false,
            changeOnClick: false,
            loop: false,
            navigateOnScroll: false,
            scrollWait: 450,
            slideOffset: 50,
            showIndex: false
        });

        u("#initialSetup").first().remove();

        console.log("winner?")
        window.human = false;

        var canvasEl = document.querySelector('.fireworks');
        var ctx = canvasEl.getContext('2d');
        var numberOfParticules = 30;
        var pointerX = 0;
        var pointerY = 0;
        var tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
        var colors = ['#FF1461', '#18FF92', '#216ae3', 'rgb(248, 245, 197)'];

        function setCanvasSize() {
            canvasEl.width = window.innerWidth * 2;
            canvasEl.height = window.innerHeight * 2;
            canvasEl.style.width = window.innerWidth + 'px';
            canvasEl.style.height = window.innerHeight + 'px';
            canvasEl.getContext('2d').scale(2, 2);
        }

        function updateCoords(e) {
            pointerX = e.clientX || e.touches[0].clientX;
            pointerY = e.clientY || e.touches[0].clientY;
        }

        function setParticuleDirection(p) {
            var angle = anime.random(0, 360) * Math.PI / 180;
            var value = anime.random(50, 180);
            var radius = [-1, 1][anime.random(0, 1)] * value;
            return {
                x: p.x + radius * Math.cos(angle),
                y: p.y + radius * Math.sin(angle)
            }
        }

        function createParticule(x, y) {
            var p = {};
            p.x = x;
            p.y = y;
            p.color = colors[anime.random(0, colors.length - 1)];
            p.radius = anime.random(16, 32);
            p.endPos = setParticuleDirection(p);
            p.draw = function () {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
            return p;
        }

        function createCircle(x, y) {
            var p = {};
            p.x = x;
            p.y = y;
            p.color = '#FFF';
            p.radius = 0.1;
            p.alpha = .5;
            p.lineWidth = 6;
            p.draw = function () {
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
                ctx.lineWidth = p.lineWidth;
                ctx.strokeStyle = p.color;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
            return p;
        }

        function renderParticule(anim) {
            for (var i = 0; i < anim.animatables.length; i++) {
                anim.animatables[i].target.draw();
            }
        }

        function animateParticules(x, y) {
            var circle = createCircle(x, y);
            var particules = [];
            for (var i = 0; i < numberOfParticules; i++) {
                particules.push(createParticule(x, y));
            }
            anime.timeline().add({
                targets: particules,
                x: function (p) { return p.endPos.x; },
                y: function (p) { return p.endPos.y; },
                radius: 0.1,
                duration: anime.random(1500, 2000),
                easing: 'easeOutExpo',
                update: renderParticule
            })
                .add({
                    targets: circle,
                    radius: anime.random(80, 160),
                    lineWidth: 0,
                    alpha: {
                        value: 0,
                        easing: 'linear',
                        duration: anime.random(600, 800),
                    },
                    duration: anime.random(1500, 2000),
                    easing: 'easeOutExpo',
                    update: renderParticule,
                    offset: 0
                });
        }

        var render = anime({
            duration: Infinity,
            update: function () {
                ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            }
        });

        // document.addEventListener(tap, function (e) {
        //     window.human = true;
        //     render.play();
        //     updateCoords(e);
        //     animateParticules(pointerX, pointerY);
        // }, false);

        var centerX = window.innerWidth / 2;
        var centerY = window.innerHeight / 2;

        function autoClick() {
            if (window.human) return;
            animateParticules(
                anime.random(centerX - 200, centerX + 200),
                anime.random(centerY - 200, centerY + 200)
            );
            anime({ duration: 800 }).finished.then(autoClick);
        }

        autoClick();
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize, false);
    });

});
// initialize echarts instance with prepared DOM
var myChart;
// var myChart = echarts.init(document.getElementById('main'));
// var desc = ["Color Trip", "aaaa", "bbbb", "ccc", "ddd", "f", "g"]
// var loadedData = [60, 55, 30, 45, 5, 30, 10]
// var maxData = Math.max.apply(Math, loadedData);

document.getElementById("webslides").addEventListener('ws:slide-change', event => {
    // event.detail.slide contains the instance with all the methods and properties listed
    console.log(event)
    if (event.detail.currentSlide0 > 0 && event.detail.currentSlide0 <= votorResponse.votes.length) {
        var vote = votorResponse.votes[event.detail.currentSlide0 - 1]
        var data = [];
        var labels = [];
        vote.choices.forEach(choice => {
            data.push(choice.score);
            labels.push(choice.choice);
        });

        // resetChart(id);
        updateData(vote.questionId, data, labels);
    } else if (event.detail.currentSlide == event.detail.slides){
        
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
                formatter: function (value, index) {
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
                fontFamily: 'Overpass',
                // align: "center",
            },
            z: 5
        },
        yAxis: {
            axisLabel: {
                textStyle: {
                    color: '#000',
                    fontSize: 24,
                },
                margin: 15,
                inside: false,
                verticalAlign: "center",
                fontFamily: 'Overpass',
                // align: "center",
            },
            interval: 1
        },
        series: [{
            name: 'Points',
            type: 'bar',
            data: freshData,
            scale: true,
            animationEasing: 'linear',
            animationDuration: function (idx) {
                return (freshData[idx] / maxData) * 10000;
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


// /* fallas 2k63 */
// window.human = false;
// function autoClick() {
//   if (window.human) return;
//   animateParticules(
//     anime.random(centerX-250, centerX+250), 
//     anime.random(centerY-150, centerY+150)
//   );
//   anime({duration: 500}).finished.then(autoClick);
// }
// autoClick();

// var canvasEl = document.querySelector('.fireworks');
// var ctx = canvasEl.getContext('2d');
// var numberOfParticules = Number(location.href.split('?')[1]) || 190;
// var pointerX = 0;
// var pointerY = 0;
// var tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
// var colors = ['#3C1518', '#69140E', '#A44200', '#D58936', '#FFF94F'];

// function setCanvasSize() {
//   canvasEl.width = window.innerWidth * 2;
//   canvasEl.height = window.innerHeight * 2;
//   canvasEl.style.width = window.innerWidth + 'px';
//   canvasEl.style.height = window.innerHeight + 'px';
//   canvasEl.getContext('2d').scale(2, 2);
// }

// function updateCoords(e) {
//   pointerX = e.clientX || e.touches[0].clientX;
//   pointerY = e.clientY || e.touches[0].clientY;
// }

// function setParticuleDirection(p) {
//   var angle = anime.random(0, -180) * Math.PI / 100;
//   var value = anime.random(0, 250);
//   var radius = [-1, 1][anime.random(0, 1)] * value;
//   return {
//     x: p.x + radius * Math.cos(angle),
//     y: p.y + radius * Math.sin(angle)
//   }
// }

// function createParticule(x,y) {
//   var p = {};
//   p.x = x;
//   p.y = y;
//   p.color = colors[anime.random(0, colors.length - 1)];
//   p.radius = anime.random(0, 10);
//   p.endPos = setParticuleDirection(p);
//   p.draw = function() {
//     ctx.beginPath();
//     ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
//     ctx.fillStyle = p.color;
//     ctx.fill();
//   }
//   return p;
// }

// function renderParticule(anim) {
//   for (var i = 0; i < anim.animatables.length; i++) {
//     anim.animatables[i].target.draw();
//   }
// }

// function animateParticules(x, y) {
//   var particules = [];
//   for (var i = 0; i < numberOfParticules; i++) {
//     particules.push(createParticule(x, y));
//   }
//   anime.timeline().add({
//     targets: particules,
//     x: function(p) { return p.endPos.x; },
//     y: function(p) { return p.endPos.y; },
//     radius: 0.1,
//     duration: anime.random(1200, 1000),
//     easing: 'easeOutExpo',
//     update: renderParticule
//   })
//     .add({
//     lineWidth: 0,
//     alpha: {
//       value: 0,
//       easing: 'linear',
//       duration: anime.random(600, 800),  
//     },
//     duration: anime.random(200, 100),
//     easing: 'easeOutExpo',
//     update: renderParticule,
//     offset: 0
//   });
// }

// var render = anime({
//   duration: Infinity,
//   update: function() {
//     ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
//   }
// });

// document.addEventListener(tap, function(e) {
//   window.human = true;
//   render.play();
//   updateCoords(e);
//   animateParticules(pointerX, pointerY);
// }, false);


// var centerX = window.innerWidth / 2;
// var centerY = window.innerHeight / 2;

// setCanvasSize();
// window.addEventListener('resize', setCanvasSize, false);