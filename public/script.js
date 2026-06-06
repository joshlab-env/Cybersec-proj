const password = document.getElementById("password");
const strength = document.getElementById("strength");

const lengthReq = document.getElementById("length");
const lowercaseReq = document.getElementById("lowercase");
const uppercaseReq = document.getElementById("uppercase");
const numberReq = document.getElementById("number");
const specialReq = document.getElementById("special");

password.addEventListener("input", () => {
  const value = password.value;

  let score = 0;

  const hasLength = value.length >= 12;
  const hasLowercase = /[a-z]/.test(value);
  const hasUppercase = /[A-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);

  updateRequirement(lengthReq, hasLength);
  updateRequirement(lowercaseReq, hasLowercase);
  updateRequirement(uppercaseReq, hasUppercase);
  updateRequirement(numberReq, hasNumber);
  updateRequirement(specialReq, hasSpecial);

  if (hasLength) score++;
  if (hasLowercase) score++;
  if (hasUppercase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  if (score <= 2) {
    strength.textContent = "Password Strength: Weak";
    strength.style.color = "#dc3545";
  } else if (score <= 4) {
    strength.textContent = "Password Strength: Medium";
    strength.style.color = "#ff9800";
  } else {
    strength.textContent = "Password Strength: Strong";
    strength.style.color = "#28a745";
  }
});

function updateRequirement(element, valid) {
  if (valid) {
    element.classList.add("valid");
    element.classList.remove("invalid");
    element.querySelector("i").className =
      "fa-solid fa-circle-check";
  } else {
    element.classList.add("invalid");
    element.classList.remove("valid");
    element.querySelector("i").className =
      "fa-solid fa-circle";
  }
}