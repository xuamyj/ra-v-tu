
// first we do this
// function getFullNameForDennis(lastName) {
//   return "Dennis" + lastName;
// }

// getFullNameForDennis("Jeong");

function getFullNameFor(firstName) {
  // look up first name info in db

  const getFullNameForFirstName = (lastName) => {
    return firstName + lastName;
  }
  return getFullNameForFirstName;
}

let a = getFullNameFor("Dennis")
a("Jeong");





