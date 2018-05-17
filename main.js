var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
var screenStack = ["lockScreen"];
var hasCard = true;
var hasMoney = true;
var foodOn = true;
var busOn = true;
var inemOn = true;
var moneyOn = true;
var partyOn = true;
var wifiOn = true;

let friendsFile;
let keepMoving = true;

$(document).ready(function() {
  startTime();
  updateGrid();
  readJSON();
});

function readJSON() {
  $.getJSON("people.json", function(data) {
    friendsFile = data;
  });
}

function disableEvents() {
  $('#mapButton').css('pointer-events','none');
  $('#settingsButton').css('pointer-events','none');
  $('#friendsButton').css('pointer-events','none');

  $('#friendsMapButton').css('pointer-events','none');
  $('#chooseFriendsButton').css('pointer-events','none');
  $('#addFriendsButton').css('pointer-events','none');
}

function enableEvents() {
  $('#mapButton').css('pointer-events','auto');
  $('#settingsButton').css('pointer-events','auto');
  $('#friendsButton').css('pointer-events','auto');

  $('#friendsMapButton').css('pointer-events','auto');
  $('#chooseFriendsButton').css('pointer-events','auto');
  $('#addFriendsButton').css('pointer-events','auto');
}

function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var day = today.getDate();
  var month = today.getMonth();
  var year = today.getFullYear();
  h = checkTime(h);
  m = checkTime(m);
  day = checkTime(day);

  $("#lockScreen > h1:first").text(h + ":" + m);
  $("#lockScreen > h2:first").text(day + " " + months[month] + " " + year);
  var t = setTimeout(startTime, 500);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

function swapCurrent(current, next) {
  $('#' + current).css({'visibility' : 'hidden'});
  $('#' + next).css({'visibility' : 'visible'});
  screenStack.push(next);
  setTimeout(enableEvents, 100);
}

function switchScreen(element) {
  if (element == 'lockScreen') {
    swapCurrent('lockScreen','mainScreen');
  }
  else if (element == 'settingsButton') {
    swapCurrent('mainScreen', 'settingsScreen');
  }

  else if (element == 'friendsButton') {
    swapCurrent('mainScreen', 'friendsScreen');
  }

  else if (element == 'mapButton') {
    swapCurrent('mainScreen', 'mapScreen');
    cleanMap();
    fillMap('map');
  }

  else if (element == 'addFriendButton') {
    swapCurrent('friendsScreen', 'addFriendScreen');
  }
  else if (element == 'chooseFriendsButton') {
    swapCurrent('friendsScreen', 'chooseFriendsScreen');
    clearFriendList();
    fillFriendList();
  }

  else if (element == 'friendsMapButton') {
    swapCurrent('friendsScreen', 'mapScreen');
    cleanMap();
    fillMap('friends');
  }
  enableEvents();
}

function goBack() {
  var current = screenStack.pop();
  if (current != 'lockScreen') {
    var next = screenStack.pop();
    swapCurrent(current,next);
  }
  else {
    screenStack.push('lockScreen');
  }
}

function homeScreen() {
  var current = screenStack.pop();
  if (current != 'lockScreen') {
    var test;
    do {
      test = screenStack.pop();
    } while (test != 'lockScreen');
    swapCurrent(current,'lockScreen');
  }
  else {
    screenStack.push('lockScreen');
  }
}

function swapCard() {
  var cpButtonCardText = document.getElementById("cpButton-card-text");
  var cpButtonMoneyText = document.getElementById("cpButton-money-text");
  var cpButtonMoney = document.getElementById("cpButton-money");

  if (hasCard) {
    hasCard = false;
    cpButtonCardText.innerText = "Sem cartão inserido";
    cpButtonMoneyText.innerText = "Indisponível";
    cpButtonMoneyText.style.color = "hsla(0,0%,60%,1)";
    cpButtonMoney.style.backgroundColor = "hsla(0,0%,60%,1)";
    cpButtonMoney.style.boxShadow = "0 0px 0px hsla(0,0%,0%,0)";

  }
  else {
    hasCard = true;
    cpButtonCardText.innerText = "Com cartão inserido";
    cpButtonMoneyText.style.color = "white";
    cpButtonMoney.style.backgroundColor = "hsla(0,0%,90%,1)";
    cpButtonMoney.style.boxShadow = "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)";

    if (hasMoney) {
      cpButtonMoneyText.innerText = "Com dinheiro";
    }
    else {
      cpButtonMoneyText.innerText = "Sem dinheiro";
    }
  }
}

function swapMoney() {
  if (hasCard) {
    if (hasMoney) {
      hasMoney = false;
      document.getElementById("cpButton-money-text").innerText = "Sem dinheiro";
    }
    else {
      hasMoney = true;
      document.getElementById("cpButton-money-text").innerText = "Com dinheiro";
    }
  }
}

function hover(element) {
  element.style.backgroundColor = "hsla(0,0%,60%,1)"
  element.style.boxShadow = "0 0px 0px hsla(0,0%,0%,0)"
}

function unhover(element) {
  if (!(hasCard == false && element.id == "cpButton-money")) {
    element.style.backgroundColor = "hsla(0,0%,90%,1)"
    element.style.boxShadow = "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)"
  }
}

function simulatePayment() {
  var currentScreen = screenStack.pop();
  screenStack.push(currentScreen);

  if (currentScreen == "confirmPurchase" || currentScreen == "successfulPurchase" || currentScreen == "failedPurchase") {
    return;
  }

  if (hasCard) {
    if (hasMoney) {
      swapCurrent(currentScreen,"confirmPurchase");
    }
    else {
      swapCurrent(currentScreen,"failedPurchase");
      document.getElementById("failedPurchaseReason").innerText = "Insufficient money";
    }
  }
  else {
    swapCurrent(currentScreen,"failedPurchase");
    document.getElementById("failedPurchaseReason").innerText = "No card";
  }
}

function decline() {
  var currentScreen = screenStack.pop();
  swapCurrent(currentScreen, "failedPurchase");
  document.getElementById("failedPurchaseReason").innerText = "Payment cancelled";
}

function accept() {
  var currentScreen = screenStack.pop();
  swapCurrent(currentScreen, "successfulPurchase");
}


function updateGrid() {
  var width = $('#map').width();
  $('#grid').width(width);
  var height = $('#map').height();
  $('#grid').height(height);
}

function zoomMore() {
  var height = $('#map').height();
  if(height + 100 < 1000){
    $('#map').height(height + 100);
    updateGrid();
  }
}

function zoomLess() {
  var height = $('#map').height();
  if(height - 100 > 200){
    $('#map').height(height - 100);
    updateGrid();
  }
}

function popUp(flag) {
  $('#mapOptionsButton').css('visibility','hidden');
  if (flag == 'mcdonalds') {
    $('#mapInfoTitle > p').eq(0).html("<b>McDonald's</b>");
    $('#mapInfoTitle > p').eq(1).html("11h-23h");
    $('#mapInfoContent > p').eq(0).html("Get a meal here.");
  }

  else if (flag == 'starbucks') {
    $('#mapInfoTitle > p').eq(0).html("<b>Starbucks</b>");
    $('#mapInfoTitle > p').eq(1).html("06h-01h");
    $('#mapInfoContent > p').eq(0).html("Get your coffee here.");
  }

  else if (flag == 'atm') {
    $('#mapInfoTitle > p').eq(0).html("<b>ATM</b>");
    $('#mapInfoTitle > p').eq(1).html("00h-24h");
    $('#mapInfoContent > p').eq(0).html("You can get cash from your bank account here.");
  }

  else if (flag == 'bus') {
    $('#mapInfoTitle > p').eq(0).html("<b>Bus</b>");
    $('#mapInfoTitle > p').eq(1).html("06h-01h");
    $('#mapInfoContent > p').eq(0).html("<b>Itineraries</b>: 225 228 340 341 650 920");
  }

  else if(flag == 'inem') {
    $('#mapInfoTitle > p').eq(0).html("<b>Emergency</b>");
    $('#mapInfoTitle > p').eq(1).html("00h-24h");
    $('#mapInfoContent > p').eq(0).html("First aid and Emergency services.");
  }

  else if(flag == 'party1') {
    $('#mapInfoTitle > p').eq(0).html("<b>OutDoors</b>");
    $('#mapInfoTitle > p').eq(1).html("19h-23h");
    $('#mapInfoContent > p').eq(0).html("7pm:<br><b>PearlJam</b><br>8.30pm:<br><b>Metallica</b><br>10pm:<br><b>AC/DC</b><br>11.30pm:<br><b>Queen</b>");

  }else if(flag == 'party2') {
    $('#mapInfoTitle > p').eq(0).html("<b>Arraial</b>");
    $('#mapInfoTitle > p').eq(1).html("22h-04h");
    $('#mapInfoContent > p').eq(0).html("9.30pm:<br><b>Holly</b><br>11pm:<br><b>ProfJam</b><br>1am:<br><b>Dillaz</b><br>1.30am:<br><b>Piruka</b>");

  }else if(flag == 'party3') {
    $('#mapInfoTitle > p').eq(0).html("<b>iTrance</b>");
    $('#mapInfoTitle > p').eq(1).html("00h-08h");
    $('#mapInfoContent > p').eq(0).html("Hilight Tribe ALL NIGHT! Featuring <b>Timmy Turner</b> past 4am.");
  }
  else if(flag == 'wifi') {
    $('#mapInfoTitle > p').eq(0).html("<b>HotSpot</b>");
    $('#mapInfoTitle > p').eq(1).html("08h-03h");
    $('#mapInfoContent > p').eq(0).html("Free Wi-Fi and charging spots for eletronic devices.");
  }
  else if (flag == 'you') {
    $('#mapInfoTitle > p').eq(0).html("<b>You</b>");
    $('#mapInfoTitle > p').eq(1).html("");
    $('#mapInfoContent > p').eq(0).html("You are currently here.");
  }
  $('#mapInfo').css('visibility','visible');
}

function hidePopUp(){
  $('#mapOptionsButton').css('visibility','visible');
  $('#mapInfo').css('visibility','hidden');
}

function showMapOptions() {
  $('#mapOptions').css('visibility','visible');
  $('#mapOptionsButton').css('visibility','hidden');
}

function hideMapOptions() {
  $('#mapOptions').css('visibility','hidden');
  $('#mapOptionsButton').css('visibility','visible');
}

function toggleMapOption(id) {
  if (id == 'food') {
    if (foodOn) {
      foodOn = false;
      $('.' + id).css('visibility','hidden');
      $('#' + id).attr('src', 'img/markers/'+id+'-g.svg');
    }
    else {
      foodOn = true;
      $('.'+id).css('visibility','visible');
      $('#'+id).attr('src', 'img/markers/'+id+'.svg');
    }
  }

  else if (id == 'bus') {
    if (busOn) {
      busOn = false;
      $('.' + id).css('visibility','hidden');
      $('#' + id).attr('src', 'img/markers/'+id+'-g.svg');
    }
    else {
      busOn = true;
      $('.'+id).css('visibility','visible');
      $('#'+id).attr('src', 'img/markers/'+id+'.svg');
    }
  }

  else if (id == 'inem') {
    if (inemOn) {
      inemOn = false;
      $('.' + id).css('visibility','hidden');
      $('#' + id).attr('src', 'img/markers/'+id+'-g.svg');
    }
    else {
      inemOn = true;
      $('.'+id).css('visibility','visible');
      $('#'+id).attr('src', 'img/markers/'+id+'.svg');
    }
  }

  else if (id == 'money') {
    if (moneyOn) {
      moneyOn = false;
      $('.' + id).css('visibility','hidden');
      $('#' + id).attr('src', 'img/markers/'+id+'-g.svg');
    }
    else {
      moneyOn = true;
      $('.'+id).css('visibility','visible');
      $('#'+id).attr('src', 'img/markers/'+id+'.svg');
    }
  }

  else if (id == 'wifi') {
    if (wifiOn) {
      wifiOn = false;
      $('.' + id).css('visibility','hidden');
      $('#' + id).attr('src', 'img/markers/'+id+'-g.svg');
    }
    else {
      wifiOn = true;
      $('.'+id).css('visibility','visible');
      $('#'+id).attr('src', 'img/markers/'+id+'.svg');
    }
  }

  else if (id == 'party') {
    if (partyOn) {
      partyOn = false;
      $('.' + id).css('visibility','hidden');
      $('#' + id).attr('src', 'img/markers/'+id+'-g.svg');
    }
    else {
      partyOn = true;
      $('.'+id).css('visibility','visible');
      $('#'+id).attr('src', 'img/markers/'+id+'.svg');
    }
  }
}

function fillMap(id) {
  let gridChildren = $("#grid").children();
  if(id === "map"){
    $('#mapOptionsButton').css('visibility','visible');
    gridChildren.eq(25).html('<img class="party" onclick="popUp(\'party1\')" src="img/markers/party.svg"/>'); // B6
    gridChildren.eq(42).html('<img class="wifi" onclick="popUp(\'wifi\')"src="img/markers/wifi.svg">'); //C3
    gridChildren.eq(54).html('<img class="party" onclick="popUp(\'party2\')" src="img/markers/party.svg">'); //C15
    gridChildren.eq(68).html('<img class="food" onclick="popUp(\'starbucks\')" src="img/markers/food.svg">'); //D9
    gridChildren.eq(70).html('<img class="food" onclick="popUp(\'mcdonalds\')" src="img/markers/food.svg">'); //D11
    gridChildren.eq(85).html('<img class="you" onclick="popUp(\'you\')" src="img/friends/you.svg">'); //E6
    gridChildren.eq(115).html('<img class="bus" onclick="popUp(\'bus\')" src="img/markers/bus.svg">'); //F16
    gridChildren.eq(121).html('<img class="money" onclick="popUp(\'atm\')" src="img/markers/money.svg">'); //G2
    gridChildren.eq(150).html('<img class="party" onclick="popUp(\'party3\')" src="img/markers/party.svg">'); //H11
    gridChildren.eq(175).html('<img class="wifi" onclick="popUp(\'wifi\')" src="img/markers/wifi.svg">'); //I16
    gridChildren.eq(185).html('<img class="inem" onclick="popUp(\'inem\')" src="img/markers/inem.svg">'); //J6
    gridChildren.eq(192).html('<img class="money" onclick="popUp(\'atm\')" src="img/markers/money.svg">'); //J13


    $(".you").css('height',30);
  }

  else if(id === "friends"){
    $.each(friendsFile.people, function() {
      if (this.onMap == true) {
        gridChildren.eq(this.pos).html('<img class="friend" onclick="popUpFriend(\'' + this.number +'\')" src="' + this.icon +'"/>');
      }
    });
    gridChildren.eq(85).html('<img class="you" onclick="popUpFriend(\'you\')" src="img/friends/you.svg">'); //E6
    $(".you").css('height',30);
    $(".friend").css('height',30);
  }
}

function cleanMap() {
  $('#mapOptionsButton').css('visibility','hidden');
  let gridChildren = $("#grid").children();
  gridChildren.each(function() {
    $(this).html("");
  });
}

function moveFriend(from, to, friend) {
  let gridChildren = $("#grid").children();
  let leftDif = gridChildren.eq(to).offset().left - gridChildren.eq(from).offset().left;
  let topDif = gridChildren.eq(to).offset().top - gridChildren.eq(from).offset().top;
  gridChildren.eq(from).children().eq(0).css('position', 'relative');
  gridChildren.eq(from).children().eq(0).animate({
    'left' : leftDif,
    'top' : topDif
  }, Math.sqrt(Math.pow(leftDif,2) + Math.pow(topDif,2))*30, function() {
    gridChildren.eq(to).html(gridChildren.eq(from).html());
    gridChildren.eq(to).children().eq(0).css({
      'left': 0,
      'top': 0
    });
    gridChildren.eq(from).html("");
    friend.pos = to;
  });
}


function pressedNumber(id){
  let textBox = $('#addFriendScreen > p').eq(0);
  if (id == "del") {
  textBox.html(textBox.html().substr(0, textBox.html().length-1));
  }
  else if (id == "ok") {
    let found = false;
    $.each(friendsFile.people, function() {
      if (this.number === textBox.text()) {
        found = true;
        this.friend = true;
        textBox.html(this.name);
      }
    });
    if (found === false) {
      textBox.css("backgroundColor","rgba(230, 100, 100, 1)");
      textBox.delay(1500).animate({"backgroundColor":"rgba(240,240,240,1)"},1000);
    }
    else {
      textBox.css("backgroundColor","rgba(100, 230, 100, 1)");
      textBox.delay(1500).animate({
        "backgroundColor":"rgba(240,240,240,1)",
        "color":"hsla(0,0%,10%,0)"
      },1000, function() {
        textBox.html("");
        textBox.css("color","hsla(0,0%,10%,1)");
      });
    }
  }
  else if (textBox.html().length<9) {
    textBox.append(id);
  }
}

function fillFriendList() {
  $.each(friendsFile.people, function() {
    if (this.friend == true) {
      let icon = 'img/add.svg';
      if (this.onMap == true) {
        icon = 'img/minus-b.svg';
      }
      $("#friendList").append('<div class="singleFriend" id="' + this.number + '"><p>' + this.name + "<br>" + this.number + '</p><img src="' + icon + '"/ onclick="toggleFriendOption(this)"></div>');
    }
  });
}

function clearFriendList() {
  $("#friendList").html("");
}

function toggleFriendOption(element){
  let number = $(element).parent().attr('id');
  $.each(friendsFile.people, function() {
    if (this.number === number) {
      if (this.onMap == true) {
        this.onMap = false;
        $(element).attr('src','img/add.svg');
      }
      else {
        this.onMap = true;
        $(element).attr('src','img/minus-b.svg');
      }
    }
  });
}


function popUpFriend(flag){
  let paragraphs = $('#singleFriendInfo > p');
  let headers = $('#singleFriendInfo > h6');
  let images = $('#singleFriendInfo > img');

  if (flag == 'you') {
    paragraphs.eq(0).html("<b>You</b>");
    headers.eq(0).html('931029483');
    images.eq(0).attr('src','img/friends/you.svg');
  }
  else {
    $.each(friendsFile.people, function() {
      if (this.number === flag) {
        paragraphs.eq(0).html("<b>"+this.name+"</b>");
        headers.eq(0).html(flag);
        images.eq(0).attr('src',this.icon);
      }
    });
  }


  $('#friendsInfo').css('visibility','visible');
}

function hidePopUpFriend() {
  $('#friendsInfo').css('visibility','hidden');
}



function movePeople() {
  $.each(friendsFile.people, function() {
    let final = Math.floor((Math.random())*240);
    if ((final < 11*20) && (final % 20) != 19 && (final != 85)) {
      moveFriend(this.pos, final, this);
    }
  });
  if (keepMoving) setTimeout(movePeople,3500);
}

function toggleMoving() {
  keepMoving = keepMoving ? false : true;

  if (keepMoving) {
    $("#cpButton-keepMoving-text").html("Continuar a mover amigos");
  }
  else {
    $("#cpButton-keepMoving-text").html("Não continuar a mover amigos");
  }
}
