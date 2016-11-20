var TwitterURLPrefix = 'https://twitter.com'
var RumorendServerURL = 'https://ec2-54-147-50-239.compute-1.amazonaws.com:5000/rumor_detect'
// var ConfidenceResultsList = [chrome.runtime.getURL('images/16_verypoor.png'),
//                         chrome.runtime.getURL('images/16_poor.png'),
//                         chrome.runtime.getURL('images/16_unsatisfactory.png'),
//                         chrome.runtime.getURL('images/16_good.png'),
//                         chrome.runtime.getURL('images/16_excellent.png')];
var ColorGradian = ["#FF0000", "#FF2A00", "#FF5400", "#FF7F00", "#F1A900", "#E3D400", "#D5FF00", "#8EFF00", "#47FF00", "#00FF00"];


chrome.storage.local.get({'shieldsUp': true}, function(items) {
  if(items.shieldsUp) {
    setUpShield();
  }
});

function setUpShield() {
  document.addEventListener('animationstart', function(event){
    if (event.animationName == 'nodeInserted') {
      tweetDiv = event.target;
      insertFactCheckIcon(tweetDiv);

      tweetId = tweetDiv.getAttribute('data-item-id');
      tweetLiId = 'stream-item-tweet-' + tweetId;
      tweetLi = document.getElementById(tweetLiId);

      // ("div").find("[data-item-id='" + tweetId + "']")

      // $(tweetDiv).addClass('scanning');

      // setTimeout(function () {
      //   $(arguments[0]).removeClass('scanning');
      //   console.log(arguments[1] + 'removed')
      // }, 5 * 1000, tweetDiv, tweetId);

      // tweetDiv.
      // tweetDiv.className += " scanning";

      tweetDivId = tweetDiv.getAttribute('data-permalink-path');
      tweetURL = TwitterURLPrefix + tweetDivId;
      // console.log(tweetURL);
      postAJAX(tweetURL, tweetDiv);

    }
  }, false);
}

function insertFactCheckIcon(tweetDiv) {
  if ($(tweetDiv).find('.stream-item-header div:last-child').hasClass('fact-check')) return;
  $(tweetDiv).find('.stream-item-header').append('<div class="fact-check twitter-bird"></div>');
  imgSrc = chrome.runtime.getURL('images/tw-small.png');
  $(tweetDiv).find(".fact-check").css('background-image', 'url(' + imgSrc + ')')
}

function updateFactCheckIcon(tweetDiv, confidence) {
  if ($(tweetDiv).find('.stream-item-header div:last-child').hasClass('fact-check')) {
    $(tweetDiv).find('.twitter-bird').remove();

    // $(tweetDiv).find('.stream-item-header').append('<div class="fact-check"></div>');
    $(tweetDiv).find('.stream-item-header').append('<div class="fact-check Icon Icon--bird" style="width: 24px; height: 24px; color: ' + ColorGradian[(confidence / 10) | 0] + '"><span class="visuallyhidden">Twitter</span></div>')


    // $(tweetDiv).find(".fact-check").css('background-image', 'url(' + ConfidenceResultsList[(confidence / 20) | 0] + ')');
  }
}

function postAJAX(tweetURL, tweetDiv) {
  var json_query = { 'url': tweetURL };
  // var xmldoc = httpRequest.responseXML;
  httpRequest = new XMLHttpRequest();
  httpRequest.tweetDiv = tweetDiv;
  httpRequest.tweetURL = tweetURL;

  function alertContents() {
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
        // var response = JSON.parse(this.responseText);
        // console.log(tweetURL + ' ' + this.responseText);
        this.responseJSON = JSON.parse(this.responseText);

        if (this.responseJSON[1] == null) {
          updateFactCheckIcon(this.tweetDiv, this.responseJSON[0]);
        } else {
          updateFactCheckIcon(this.tweetDiv, Math.min.apply(Math, this.responseJSON));
        }
        console.log(this.tweetURL + ": " + this.responseText);
        // alert(response.computedString);
      } else {
        console.log("ERROR: " + this.tweetURL + ": " + this.responseText);
        // alert('There was a problem with the request.');
      }
    }
  }

  httpRequest.onreadystatechange = alertContents;
  httpRequest.open('POST', RumorendServerURL);
  httpRequest.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  httpRequest.send(JSON.stringify(json_query));
}
