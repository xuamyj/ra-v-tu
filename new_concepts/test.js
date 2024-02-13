class Test {

  myFunction () {

  }

  myArrowFunction = () => {

  }
}

function main() {
  this.age = 15;

  function regularFunction () {
    console.log(this);
  };

  this.regularFunction = regularFunction;

  const arrowFunction = ()=>{
    console.log(this);
  };
  this.arrowFunction = arrowFunction;
}

const newObj = new main();
// console.log(newObj);
// console.log("regularFunction");
// newObj.regularFunction();
// console.log();
// console.log("arrowFunction");
// newObj.arrowFunction();

const outerRegularFunction = newObj.regularFunction;
const outerArrowFunction = newObj.arrowFunction;

function blob() {
  this.num = 20;

  const blobFunc = newObj.regularFunction;
  blobFunc();
}

const b = new blob();

// console.log("outerRegularFunction");
// outerRegularFunction();
// console.log();
// console.log("outerArrowFunction");
// outerArrowFunction();

// console.log(main());



// function makeNewObj () {
//   const newObj = {};
//   //@ts-ignore
//   newObj.age = 15;
//   return newObj; 
// }