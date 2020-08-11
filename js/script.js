javascript: window.load = function(){
  function requestData(url, type, callback){
    return fetch(url)
    .then(function(response){
      if (response.ok) {
        switch(type){
          case 'text': return response.text();
          case 'blob': return response.blob();
        }
      }
    })
    .then(function(response){
      callback(response);
    });
  }

  function flickr(){
    var style = document.createElement('style');

    style.textContent = '\
    .anchors {position:absolute;top:0;left:0;z-index:10;padding:5px;}\
    .anchor {display:inline-flex;justify-content:center;align-items:center;margin-top:4px;margin-right:4px;width:20px;height:20px;border-radius:5px;background-color:rgba(255, 255, 255, 0.5);font-size:14px;line-height:1;color:rgb(0, 0, 0)!important;}\
    .anchor:hover {background-color:rgb(255, 255, 255, 1);}'.replace(/ /g, '');

    document.querySelector('body').appendChild(style);

    document.addEventListener('mouseover', function(event){
      var parent, anchors, url;

      if (event.target.tagName == 'A' && event.target.classList.contains('overlay')) {
        parent = event.target.parentNode;

        if (parent.dataset.fetch) return;

        anchors = document.createElement('span');
        anchors.setAttribute('class', 'anchors');
        parent.appendChild(anchors);
        url = ['https://www.flickr.com', event.target.href.match(/\/photos\/[-a-zA-Z0-9@:%._\-\+~#=]{1,50}\/[0-9]{1,20}\//g)[0], 'sizes/'].join('');

        requestData(url, 'text', function(text){
          var array = text.match(/\/photos\/[-a-zA-Z0-9@:%._\-\+~#=]{1,50}\/[0-9]{1,11}\/sizes\/[a-z0-9]{1,2}\//g)
            , anchor;

          while(array.length){
            anchor = document.createElement('button');
            anchor.setAttribute('class', 'anchor');
            anchor.setAttribute('href', array[0]);
            anchor.setAttribute('target', '_blank');
            array[0] = array[0].split('/');
            anchor.textContent = array[0][array[0].length - 2];
            anchors.appendChild(anchor);
            array.shift();
          }
        });

        parent.dataset.fetch = true;
      }
    });

    document.addEventListener('click', function(event){
      if (event.target.classList.contains('anchor')) {
        requestData(event.target.getAttribute('href'), 'text', function(text){
          var array = text.match(/live.staticflickr.com\/[0-9]{1,10}\/[a-z0-9_]{1,100}.[a-z]{3}/g)
            , url = ['https://', array[array.length-1]].join('');

          requestData(url, 'blob', function(blob){
            var reader = new FileReader();

            reader.readAsDataURL(blob);
            reader.onloadend = function(){
              var anchor = document.createElement('a');

              url = url.split('/');
              anchor.setAttribute('href', reader.result);
              anchor.setAttribute('download', url[url.length-1]);
              anchor.click();
            }
          });
        });

        event.preventDefault();
      }
    });
  }

  function wallhaven(){
    var style = document.createElement('style');

    style.textContent = '\
    .iframe-hidden {overflow:hidden;position:fixed;top:0;left:0;z-index:-1;width:0;height:0;}\
    .anchor {position:fixed;top:0;left:0;z-index:-1;width:0;height:0;}'.replace(/ /g, '');

    document.querySelector('body').appendChild(style);

    document.addEventListener('click', function(event){
      if (event.target.classList.contains('preview')) {
        requestData(event.target.href, 'text', function(text){
          var array = text.match(/https:\/\/w.wallhaven.cc\/full\/[a-z0-9]{0,10}\/wallhaven-[a-z0-9]{0,10}.[a-z]{3}/g);
          var url = array[0];

          requestData(url, 'blob', function(blob){
            var reader = new FileReader();

            reader.readAsDataURL(blob);
            reader.onloadend = function(){
              var anchor = document.createElement('a');

              url = url.split('/');
              anchor.setAttribute('href', reader.result);
              anchor.setAttribute('download', url[url.length-1]);
              anchor.click();
            }
          });
        });

        event.preventDefault();
      }
    });
  }

  switch(location.host){
    case 'www.flickr.com': flickr(); break;
    case 'wallhaven.cc': wallhaven(); break;
  }
}();