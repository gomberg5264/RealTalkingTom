# Real Talking tom
This was done for kids for fun.  Click on the head to start talking. You can choose your language in which you are comfortable to talk. 

[![View the demo on Vimeo](https://i.vimeocdn.com/video/690202236.webp?mw=1920&mh=1080&q=70)](https://vimeo.com/261249587)

View the demo on [Vimeo](https://vimeo.com/261249587/)


### Business use case
For people whose primary or secondary language is not English and wanted to contact customer support for some reason, but refrain because most of the cs agents speak English and 1 or 2  local languages only.

Though AI bots supports multi lingual like api.ai, the number of languages supported by api.ai are very limited and also the effort to train each bot individually is huge and not feasible.

### To do
Use a better translation service like Microsoft or Google, instead of Yandex.

### How to run on you local host 
Have checked in the env locally, so just clone, install and run index.js

```
$ git clone https://github.com/mpnkhan/RealTalkingTom.git
$ cd RealTalkingTom
$ npm install 
$ node index.js
On your chrome browser http://localhost:3000/
```


### Note:
This demo uses the experimental Web Speech API, which is currently only [supported](http://caniuse.com/#search=speech) by Blink-based browsers including Chrome 25+, Opera 27+, Samsung Internet, QQ Browser, and Baidu Browser.

