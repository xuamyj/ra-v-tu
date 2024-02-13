
function doStuff() {
  const a = 1; 
  const b = 2;
  const c = a + b;
  console.log("Hi " + c);
  return c;
}

() => {
  const a = 1; 
  const b = 2;
  const c = a + b;
  console.log("Hi " + c);
  return c;
}

function noMath() {
  console.log("Hi no math involved");
}

// function doStuff(a, b) { // doStuff(1, 2)
//   const c = a + b;
//   console.log("Hi " + c);
//   return c;
// }

function findTheRightFunc() {
  if (userInput === 'y') {
    return doStuff;
  } else {
    return noMath;
  }
}



function main() {
  doStuff();
  doStuff(1, 2);

  // get user input "Math"?
  const userInput = "y"


  // PROBLEM 1
  let eventualFunction = null;
  if (userInput === 'y') {
    eventualFunction = doStuff;
  } else {
    eventualFunction = noMath;
  }

  eventualFunction = findTheRightFunc();


  eventualFunction();


  //PROBLEM 2 
  // c = doStuff();


  c = (() => {
    // if (userInput === 'y') {
    //   return doStuff;
    // } else {
    //   return noMath;
    // }

    const a = 1; 
    const b = 2;
    const c = a + b;
    console.log("Hi " + c);
    return c;
  })();


  // const a = 1; 
  // const b = 2;
  // const c = a + b;
  // console.log("Hi " + c);
  // // return c;
}