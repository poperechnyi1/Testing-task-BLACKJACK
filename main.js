var dealerCards = [];  // Arrays holding the DisplayCard objects used to show the cards
var playerCards = [];

dealerCards.count = 0;  // Number of cards actually in the dealer's hand
playerCards.count = 0;   // Number of cards actually in the player's hand

var deck = new Deck();

var gameInProgress = false;

var bet;
var betInput;
var money;
var moneyDisplay;
var message;

var standButton, hitButton, newGameButton;  // objects representing the buttons, so I can enable/disable them

/*начальная настройка*/
function setup() {
    for (var i = 1; i <= 5; i++) {
       dealerCards[i] = new DisplayedCard("dealer" + i);
       dealerCards[i].cardContainer.style.display = "none";
       playerCards[i] = new DisplayedCard("player" + i);
       playerCards[i].cardContainer.style.display = "none";
    }
    message = document.getElementById("message");
    standButton = document.getElementById("standButton");
    hitButton = document.getElementById("hitButton");
    newGameButton = document.getElementById("newGameButton");
    moneyDisplay = document.getElementById("money");
    money = 100;
    moneyDisplay.innerHTML = "$" + money;
    betInput = document.getElementById("bet");
    betInput.value = 10;
    betInput.disabled = false;
    standButton.disabled = true;
    hitButton.disabled = true;
    newGameButton.disabled = false;
}

/*карты на руках*/
function dealCard(cards, runOnFinish, faceDown) {
    var crd = deck.nextCard();
    cards.count++;
    if (faceDown)
       cards[cards.count].setFaceDown();
    else
       cards[cards.count].setFaceUp();
    cards[cards.count].setCard(crd);
    new Effect.SlideDown(cards[cards.count].cardContainer, {
       duration: 0.5,
       queue: "end",
       afterFinish: runOnFinish
    });
}

/*подсчет балов (ОЧКОВ)*/
function getTotal(hand) {
   var total = 0;
   var ace = false;
   for (var i = 1; i <= hand.count; i++) {
       total += Math.min(10, hand[i].card.value);
       if (hand[i].card.value == 1)
          ace = true;
   }
   if (total + 10 <= 21 && ace)
      total += 10;
   return total;
}

/*начало игры*/
function startGame() {
   if (!gameInProgress) {
      var betText = betInput.value;
      if ( ! betText.match(/^[0-9]+$/) || betText < 1 || betText > money) {
          message.innerHTML = "Ставка должна быть от 1 до " + money +
               ".<br> Устранить эту проблему и снова нажмите Новая игра .";
          new Effect.Shake("betdiv");
          return;
      }
      betInput.disabled = true;
      bet = Number(betText);
      for (var i = 1; i <= 5; i++) {
          playerCards[i].cardContainer.style.display = "none";
          playerCards[i].setFaceDown();
          dealerCards[i].cardContainer.style.display = "none";
          dealerCards[i].setFaceDown();
      }
      message.innerHTML = "Распредиление карт";
      deck.shuffle();
      dealerCards.count = 0;
      playerCards.count = 0;
      dealCard(playerCards);
      dealCard(dealerCards);
      dealCard(playerCards);
      dealCard(dealerCards, function() {
             standButton.disabled = false;
             hitButton.disabled = false;
             newGameButton.disabled = true;
             gameInProgress = true;
             var dealerTotal = getTotal(dealerCards);
             var playerTotal = getTotal(playerCards);
             if (dealerTotal == 21) {
                if (playerTotal == 21)
                    endGame(false, "У Вас Блекджек, но дилер победил.");
                else
                    endGame(false, "У дилера Блекджек.");
             }
             else if (playerTotal == 21)
                endGame(true, "У вас Блекджек.");
             else
                message.innerHTML = "У вас " + playerTotal +".  Еще или Остановить?";
          }, true);
   }
}

/*Окончание игры, оглашение результатов*/
function endGame(win, why) {
     if (win)
         money += bet;
     else
         money -= bet;
     message.innerHTML = (win ? "Поздравляем! Вы победили.  " : "Увы! Вы проиграли.  ") + why +
           (money > 0 ? "<br>Нажмите Новая игра и сыграете ещё раз." : "<br>Похоже, у Вас закончились деньги!");
     standButton.disabled = true;
     hitButton.disabled = true;
     newGameButton.disabled = true;
     gameInProgress = false;
     if (dealerCards[2].faceDown) {
       dealerCards[2].cardContainer.style.display = "none";
       dealerCards[2].setFaceUp();
       new Effect.SlideDown(dealerCards[2].cardContainer, { duration: 0.5, queue: "end" });
     }
     new Effect.Fade(moneyDisplay, {
        duration: 0.5,
        queue: "end",
        afterFinish: function() {
            moneyDisplay.innerHTML = "$" + money;
            new Effect.Appear(moneyDisplay, {
               duration: 0.5,
               queue: "end",
               afterFinish: function() {
                   if (money <= 0) {
                        betInput.value = "БАНКРОТ";
                        new Effect.Shake(moneyDisplay);
                   }
                   else {
                       if (bet > money)
                          betInput.value = money;
                       standButton.disabled = true;
                       hitButton.disabled = true;
                       newGameButton.disabled = false;
                       betInput.disabled = false;
                   }
               }
            });
        }
     });
}

/*Дилер играет и игра заканчиваться*/
function dealersTurnAndEndGame() {
    message.innerHTML = "Дилер тянет..";
    dealerCards[2].cardContainer.style.display = "none";
    dealerCards[2].setFaceUp();
    var takeNextCardOrFinish = function() {
       new Effect.SlideDown(dealerCards[dealerCards.count].cardContainer, {
          duration: 0.5,
          queue: "end",
          afterFinish: function() {
              var dealerTotal = getTotal(dealerCards);
              if (dealerCards.count < 5 && dealerTotal <= 16) {
                  dealerCards.count++;
                  dealerCards[dealerCards.count].setCard(deck.nextCard());
		          dealerCards[dealerCards.count].setFaceUp();
                  takeNextCardOrFinish();
              }
              else if (dealerTotal > 21)
                 endGame(true, "Дилер перебрал за 21.");
              else if (dealerCards.count == 5)
                 endGame(false, "Дилер вытянул 5, карт без перебора 21.");
              else {
                 var playerTotal = getTotal(playerCards);
                 if (playerTotal > dealerTotal)
                    endGame(true, "Вы имеете " + playerTotal + ". Дилер имеет " + dealerTotal + ".");
                 else if (playerTotal < dealerTotal)
                    endGame(false, "Вы имеете " + playerTotal + ". Дилер имеет " + dealerTotal + ".");
                 else
                    endGame(false, "Вы и дилер имеете" + playerTotal + ".");
              }
          }
       });
    };
    takeNextCardOrFinish();
}

/*Тянуть карту еще*/
function hit() {
   if (!gameInProgress)
      return;
   standButton.disabled = true;
   hitButton.disabled = true;
   dealCard(playerCards, function() {
      var playerTotal = getTotal(playerCards);
      if (playerTotal > 21)
         endGame(false, "ВЫ ПЕРЕБРАЛИ ЗА 21!");
      else if (playerCards.count == 5)
         endGame(true, "Вы вытянули 5 карт и не перебрали 21.");
      else if (playerTotal == 21)
         dealersTurnAndEndGame();
      else {
         message.innerHTML = "У Вас есть " + playerTotal + ". Еще или Остановить?";
         hitButton.disabled = false;
         standButton.disabled = false;
      }
   });
}

/*ОСТАНОВИТЬ*/
function stand() {
   if (!gameInProgress)
      return;
   hitButton.disabled = true;
   standButton.disabled = true;
   dealersTurnAndEndGame();
}

onload=setup;
