import { usePostalCodeValidation } from 'postal-code-checker'

const { validatePostalCode } = usePostalCodeValidation()

const constraints = {
  email: /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  , password: [/^.{8,20}$/, /[a-z]+[A-Z]/, /\d/, /\W/]
}

const errorMsgs = {
  empty: 'required'
  , email: 'Enter a valid address (e.g., me@email.com)'
  , country: ''
  , postalCode: ''
  , password: 'Not strong enough'
  , passwordMatch: 'Passwords must match'
}

function setCodeError (msg) {
  errorMsgs.postalCode = `Enter a valid format\n${msg}`
}

const blankCountry = function () {
    const country = document.getElementById('country')
    const errLine = document.querySelector('#country + .error')
    const errMsg = errLine.querySelector('span + span')
    if (country.value === '') {
      errLine.hidden = false
      errLine.classList.add('active')
      errMsg.textContent = errorMsgs.empty
      country.classList.add('invalid')
    } else {
      errLine.hidden = true
      errLine.classList.remove('active')
      country.classList.remove('invalid')
    }
}

const blankField = function (node) {
    const errLine = node.nextElementSibling
    const errMsg = errLine.querySelector('span + span')
    if (node.value === '') {
      errLine.hidden = false
      errLine.classList.add('active')
      errMsg.textContent = errorMsgs.empty
      node.classList.add('invalid')
      node.classList.remove('valid')
    }
}

const code = function (node, testParam) {
  const testString = node.value.toUpperCase()
  if (testString === '') {
    node.classList.remove('valid', 'invalid')
    return
  }
  if (!validatePostalCode(testParam, testString)) {
    node.classList.add('invalid')
    node.classList.remove('valid')
    return errorMsgs.postalCode
  } else {
    node.classList.add('valid')
    node.classList.remove('invalid')
  }
}

const email = function (node) {
  const testString = node.value
  const expression = new RegExp(constraints.email, 'i')
  if (testString === '') {
    node.classList.remove('valid', 'invalid')
    return
  }
  if (!expression.test(testString)) {
    node.classList.add('invalid')
    node.classList.remove('valid')
    return errorMsgs.email
  } else {
    node.classList.add('valid')
    node.classList.remove('invalid')
  }
}

const form = function (node) {
  const inputs = [...node.querySelectorAll('input')].map((item) => item.value)
  const selects = [...node.querySelectorAll('select')].map((item) => item.value)
  const errors = document.querySelectorAll('.active')
  const errorFree = errors.length === 0
  const filledIn = 
    inputs.filter((entry) => entry === '').length === 0 &&
    selects.filter((entry) => entry === '').length === 0
  const isValid = errorFree && filledIn
  return isValid
}

const passMatch = function (node, string) {
  if (node.value === '') {
    node.classList.remove('valid', 'invalid')
    return
  }
  if (node.value !== string) {
    node.classList.add('invalid')
    node.classList.remove('valid')
    return errorMsgs.passwordMatch
  } else {
    node.classList.add('valid')
    node.classList.remove('invalid')
  }
}

const password = function (node) {
  const conf = document.getElementById('password-conf')
  const rules = document.querySelectorAll('.rule')
  const regExp = constraints.password
  let unmet = 0
  if (node.value === '') {
    node.classList.remove('valid', 'invalid')
    conf.disabled = true
    rules.forEach((rule) => {
      rule.classList.remove('met')
      rule.firstElementChild.textContent = 'close'
    })
    return
  }
  regExp.forEach((exp) => {
    const rule = rules[regExp.indexOf(exp)]
    if (exp.test(node.value)) {
      rule.classList.add('met')
      rule.firstElementChild.textContent = 'check'
    } else {
      rule.classList.remove('met')
      rule.firstElementChild.textContent = 'close'
      unmet++
    }
  })
  if (unmet) {
    node.classList.add('invalid')
    node.classList.remove('valid')
    conf.disabled = true
    return errorMsgs.password
  } else {
    node.classList.add('valid')
    node.classList.remove('invalid')
    conf.disabled = false
  }
}

export {
  setCodeError
  , blankCountry
  , blankField
  , code
  , email
  , form
  , passMatch
  , password
}