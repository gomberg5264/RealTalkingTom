  'use strict';

  const socket = io();

  const outputYou = document.querySelector('.output-you');
  const outputBot = document.querySelector('.output-bot');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  let synth = window.speechSynthesis;
  let utterance = new SpeechSynthesisUtterance();
  let defaultLang= "";
  let needTranslation = false;

  const langs =[{"hi":"Hindi"}, {"te":"Telugu"},{"ml":"Malayalam"},{"ta":"Tamil"},{"ar":"Arabic"},{"th":"Thai"},{"az":"Azerbaijan"},{"sq":"Albanian"},{"am":"Amharic"},{"en":"English"},{"hy":"Armenian"},{"af":"Afrikaans"},{"eu":"Basque"},{"ba":"Bashkir"},{"be":"Belarusian"},{"bn":"Bengali"},{"my":"Burmese"},{"bg":"Bulgarian"},{"bs":"Bosnian"},{"cy":"Welsh"},{"hu":"Hungarian"},{"vi":"Vietnamese"},{"(Creole)":"Haitian"},{"gl":"Galician"},{"nl":"Dutch"},{"Mari":"Hill"},{"el":"Greek"},{"ka":"Georgian"},{"gu":"Gujarati"},{"da":"Danish"},{"he":"Hebrew"},{"yi":"Yiddish"},{"id":"Indonesian"},{"ga":"Irish"},{"it":"Italian"},{"is":"Icelandic"},{"es":"Spanish"},{"kk":"Kazakh"},{"kn":"Kannada"},{"ca":"Catalan"},{"ky":"Kyrgyz"},{"zh":"Chinese"},{"ko":"Korean"},{"xh":"Xhosa"},{"km":"Khmer"},{"lo":"Laotian"},{"la":"Latin"},{"lv":"Latvian"},{"lt":"Lithuanian"},{"lb":"Luxembourgish"},{"mg":"Malagasy"},{"ms":"Malay"},{"mt":"Maltese"},{"mk":"Macedonian"},{"mi":"Maori"},{"mr":"Marathi"},{"mhr":"Mari"},{"sk":"Slovakian"},{"mn":"Mongolian"},{"de":"German"},{"ne":"Nepali"},{"no":"Norwegian"},{"pa":"Punjabi"},{"pap":"Papiamento"},{"fa":"Persian"},{"pl":"Polish"},{"pt":"Portuguese"},{"ro":"Romanian"},{"ru":"Russian"},{"ceb":"Cebuano"},{"sr":"Serbian"},{"si":"Sinhala"},{"sl":"Slovenian"},{"sw":"Swahili"},{"su":"Sundanese"},{"tg":"Tajik"},{"tl":"Tagalog"},{"tt":"Tatar"},{"tr":"Turkish"},{"udm":"Udmurt"},{"uz":"Uzbek"},{"uk":"Ukrainian"},{"ur":"Urdu"},{"fi":"Finnish"},{"fr":"French"},{"hr":"Croatian"},{"cs":"Czech"},{"sv":"Swedish"},{"gd":"Scottish"},{"et":"Estonian"},{"eo":"Esperanto"},{"jv":"Javanese"},{"ja":"Japanese"}];

  let voices = [];
  let filteredvoices=[];
  let optStr='';
  let langCode ='en';

  let populateVoiceList = () => {
      voices = speechSynthesis.getVoices();      
        langs.forEach(obj => {
          for (const key in obj) {
            // console.log(key,obj[key])
            voices.forEach(voice => {
              const voiceLangCode = voice.lang.split('-')[0];
              if(key === voiceLangCode){
                filteredvoices.push(voice);
                optStr += '<option value="'+voice.lang + '" data-name="'+ voice.name + '">'+ obj[key] + '-'+ voice.name + ' (' + voice.lang + ')' +'</option>'+ "\n";
                if(defaultLang.length === 0) defaultLang = voice.lang;
              }  
            })
          }  
        });
          select_dialect.innerHTML= optStr;
          utterance.voice = filteredvoices[0];
          recognition.lang = defaultLang;
          // console.log('selecting initial voice', utterance.voice, defaultLang)
  }
  populateVoiceList();      
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }


  let selectVoice = () => {
    const sel = select_dialect.options[select_dialect.selectedIndex]
    const destLang = sel.value;
    const name = sel.getAttribute('data-name');
      // console.log(destLang, name);
      for(let i = 0; i < voices.length ; i++) {
        // console.log(voices[i].lang, destLang)
        if(voices[i].lang === destLang && voices[i].name === name) {
          recognition.lang = voices[i].lang;          
          // console.log('selecting voice', voices[i])
          // console.log('lang chosen', defaultLang)
          utterance.voice = voices[i];
        }
      }
  }

  select_dialect.onchange = function(){
    selectVoice();
  }

  recognition.lang = defaultLang || 'en-US';

  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  // recognition.continuous = true;
  // recognition.interimResults = true;

  // defaultLang.split('-')[0] !==

  let translate = (srcLang, destLang, sourceText) => {    
    // console.log(srcLang, destLang, sourceText);
    return new Promise((resolve, reject) => {
      var url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20180227T153414Z.9ed01c64b4d67f22.65c0e3491afd123211d9a52f250dffcc2ea51652&lang='+srcLang +'-' + destLang + '&text='+ encodeURI(sourceText);        
      fetch(url ,{cache:'force-cache'})
        .then(function(response) {
          return response.json();
        })
        .then(function(result) {
          // console.log('inside', result.text)
          // console.log(srcLang, destLang, sourceText, result.text);          
          resolve(result.text);
        });             
    });  
  }  
  document.querySelector('.head').addEventListener('click', (e) => {
      e.preventDefault();
    recognition.start();
    document.querySelector('#rollover').className='listen';
    outputYou.textContent = '';
    outputBot.textContent = '';

  });

  // document.querySelector('#BtnTomtalk').addEventListener('click', () => {
  //   recognition.start();
  //   document.querySelector('#rollover').className='listen';
  // });

  recognition.addEventListener('speechstart', () => {
     console.log('Speech has been detected.');
  });

  recognition.addEventListener('result', (e) => {
    // console.log('Result has been detected.');

    let last = e.results.length - 1;
    let text = e.results[last][0].transcript;

    outputYou.textContent = text;
    // console.log('Confidence: ' + e.results[0][0].confidence);
    langCode = recognition.lang.split('-')[0];
    if( langCode !=='en'){
      translate(langCode ,'en',text)
        .then(function(response) {
            console.log('tranlated text',response);
            socket.emit('chat message', response);
        })
    }else{
      socket.emit('chat message', text);
    }
  });

  recognition.addEventListener('speechend', () => {
    recognition.stop();
  });

  recognition.addEventListener('error', (e) => {
    outputBot.textContent = 'Error: ' + e.error;
  }) 

  function synthVoice(text) {
    utterance.text = text;
    synth.speak(utterance); 
  }

socket.on('bot reply', function(replyText) {
  if(replyText == '') replyText = '(No answer...)';
  document.querySelector('#rollover').className='talk';
  // console.log('LangCode' , langCode);
  if( langCode !=='en'){
    translate('en',langCode, replyText)
      .then(function(response) {
        outputBot.textContent = response;
        synthVoice(response);
      })
  }else{
        outputBot.textContent = replyText;
        synthVoice(replyText);
  }
  setTimeout(() => { document.querySelector('#rollover').className='normal' }, 5000);

});
