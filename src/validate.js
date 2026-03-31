import { usePostalCodeValidation } from 'postal-code-checker'

const { validatePostalCode } = usePostalCodeValidation()

const validator = {
  constraints: {
    email: /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
    , password: [/^.{8,20}$/, /[a-z]+[A-Z]/, /\d/, /\W/]
  }
  , errorMsgs: {
    empty: 'required'
    , email: 'Enter a valid address (e.g., me@email.com)'
    , country: ''
    , postalCode: ''
    , password: 'Not strong enough'
    , passwordMatch: 'Passwords must match'
  }
  , blankCountry () {
    const country = document.getElementById('country')
    const errLine = document.querySelector('#country + .error')
    const errMsg = errLine.querySelector('span + span')
    if (country.value === '') {
      errLine.hidden = false
      errLine.classList.add('active')
      errMsg.textContent = this.errorMsgs.empty
      country.classList.add('invalid')
    } else {
      errLine.hidden = true
      errLine.classList.remove('active')
      country.classList.remove('invalid')
    }
  }
  , blankField (node) {
    const errLine = node.nextElementSibling
    const errMsg = errLine.querySelector('span + span')
    if (node.value === '') {
      errLine.hidden = false
      errLine.classList.add('active')
      errMsg.textContent = this.errorMsgs.empty
      node.classList.add('invalid')
      node.classList.remove('valid')
    }
  }
  , code (node, testParam) {
    const testString = node.value.toUpperCase()
    if (testString === '') {
      node.classList.remove('valid', 'invalid')
      return
    }
    if (!validatePostalCode(testParam, testString)) {
      node.classList.add('invalid')
      node.classList.remove('valid')
      return this.errorMsgs.postalCode
    } else {
      node.classList.add('valid')
      node.classList.remove('invalid')
    }
  }
  , email (node) {
    const testString = node.value
    const expression = new RegExp(this.constraints.email, 'i')
    if (testString === '') {
      node.classList.remove('valid', 'invalid')
      return
    }
    if (!expression.test(testString)) {
      node.classList.add('invalid')
      node.classList.remove('valid')
      return this.errorMsgs.email
    } else {
      node.classList.add('valid')
      node.classList.remove('invalid')
    }
  }
  , form (node) {
    const inputs = [...node.querySelectorAll('input')].map((item) => item.value)
    const selects = [...node.querySelectorAll('select')].map(
      (item) => item.value
    )
    const errors = document.querySelectorAll('.active')
    const errorFree = errors.length === 0
    const filledIn = 
      inputs.filter((entry) => entry === '').length === 0 &&
      selects.filter((entry) => entry === '').length === 0
    const isValid = errorFree && filledIn
    return isValid
  }
  , passMatch (node, string) {
    if (node.value === '') {
      node.classList.remove('valid', 'invalid')
      return
    }
    if (node.value !== string) {
      node.classList.add('invalid')
      node.classList.remove('valid')
      return this.errorMsgs.passwordMatch
    } else {
      node.classList.add('valid')
      node.classList.remove('invalid')
    }
  }
  , password (node) {
    const conf = document.getElementById('password-conf')
    const rules = document.querySelectorAll('.rule')
    const regExp = this.constraints.password
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
      return this.errorMsgs.password
    } else {
      node.classList.add('valid')
      node.classList.remove('invalid')
      conf.disabled = false
    }
  }
  , setCodeError (msg) {
    this.errorMsgs.postalCode = `Enter a valid format\n${msg}`
  }
}

export function addValidation () {
  const code = document.getElementById('pcode')
  const codeEvents = ['input', 'focus']
  const country = document.getElementById('country')
  const email = document.getElementById('email')
  const form = document.querySelector('form')
  const password = document.getElementById('password')
  const pwConf = document.getElementById('password-conf')
  const ruleBox = document.querySelector('.pw-rules')
  const submit = document.querySelector('button[type="submit"]')

  pwConf.disabled = true
  submit.disabled = true

  submit.title = 'Complete all fields'

  code.addEventListener('blur', () => validator.blankField(code))
  codeEvents.forEach((eventType) => {
    code.addEventListener(eventType, () => checkCode())
  })
  country.addEventListener('blur', () => validator.blankCountry())
  country.addEventListener('change', () => {
    validator.setCodeError(code.placeholder)
    checkCode()
  })
  email.addEventListener('blur', () => validator.blankField(email))
  email.addEventListener('input', () => {
    const message = validator.email(email)
    activateError('email', message)
  })
  form.addEventListener('input', () => {
    submit.disabled = validator.form(form) ? false : true
    submit.title = validator.form(form) ? 'Submit form' : 'Complete all fields'
  })
  form.addEventListener('change', () => {
    submit.disabled = validator.form(form) ? false : true
    submit.title = validator.form(form) ? 'Submit form' : 'Complete all fields'
  })
  password.addEventListener('blur', () => {
    ruleBox.hidden = true
    validator.blankField(password)
  })
  password.addEventListener('focus', () => ruleBox.hidden = false)
  password.addEventListener('input', () => {
    const message = validator.password(password)
    activateError('password', message)
  })
  pwConf.addEventListener('blur', () => validator.blankField(pwConf))
  pwConf.addEventListener('input', () => {
    const message = validator.passMatch(pwConf, password.value)
    activateError('password-conf', message)
  })

  function activateError (id, message) {
    const errLine = document.querySelector(`#${id} + .error`)
    const errMsg = errLine.querySelector('span + span')
    if (message) {
      errLine.hidden = false
      errLine.classList.add('active')
      errMsg.textContent = message
    } else {
      errLine.hidden = true
      errLine.classList.remove('active')
    }
  }
  function checkCode () {
    const selected = country.value
    const message = validator.code(code, selected)
    activateError('pcode', message)
  }
}