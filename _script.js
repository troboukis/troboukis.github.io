const HOURHAND = document.querySelector("#hour");
const MINUTEHAND = document.querySelector("#minute");
const SECONDHAND = document.querySelector("#second");

var date = new Date();
console.log(date);
let hr = date.getHours();
let min = date.getMinutes();
let sec = date.getSeconds();
console.log("Hour: " + hr + " Minute: " + min + " Second: " + sec);

let hrPosition = (hr*360/12)+(min*(360/60)/12);
let minPosition = (min*360/60)+(sec*(360/60)/60);
let secPosition = sec*360/60;

function runTheClock() {

    hrPosition = hrPosition+(3/360);
    minPosition = minPosition+(6/60);
    secPosition = secPosition+6;

    HOURHAND.style.transform = "rotate(" + hrPosition + "deg)";
    MINUTEHAND.style.transform = "rotate(" + minPosition + "deg)";
    SECONDHAND.style.transform = "rotate(" + secPosition + "deg)";

}

var interval = setInterval(runTheClock, 1000);

let screenLog = document.querySelector('#screen-log');
document.addEventListener('mousemove', logKey);

const SCREENLOG = document.querySelector('#screenLog');
function logKey(e) {
  screenLog.innerText = `
    Position of the cursor (clientX + clientY): ${e.clientX}, ${e.clientY}`;
}
const AREA = document.body;
const CIRCLE = document.querySelector('.circle')

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

// ΦΤΙΑΧΝΟΥΜΕ ΤΑ functions
function mouseCoordinates(e){
  //get the mouse position
  var horizontalPosition = windowWidth-e.clientX-26;
  var verticalPosition = windowWidth-e.clientY-26;

  //set the cicle position based on the one of the mousemove
  CIRCLE.style.left = horizontalPosition + 'px';
  CIRCLE.style.top = verticalPosition + 'px';
}

function changeColorOnTouch(){
  CIRCLE.style.backgroundColor = 'gray';
  CIRCLE.style.borderColor = 'yellow';
}

// ΔΗΜΙΟΥΡΓΟΥΜΕ ΤΑ events (eventListenter)
//όταν μετακινείται στην AREA που έχουμε ορίσει:
AREA.addEventListener('mousemove',mouseCoordinates,false);
CIRCLE.addEventListener('mouseenter', changeColorOnTouch, false);
CIRCLE.addEventListener('mouseleave', function(){CIRCLE.removeAttribute('style');},false);



// When the mouse leaves the circle, remove inline styles with an anonymous function.
// CIRCLE.addEventListener('mouseleave', function(){CIRCLE.removeAttribute("style");}, false);
