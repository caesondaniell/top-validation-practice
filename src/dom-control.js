import { 
  getAllCountries
  , usePostalCodeValidation
  , getCountryByCode
} from 'postal-code-checker'

const countries = getAllCountries()
const creator = {
  element (tag) { return document.createElement(tag) }
  , errorLine (who) {
    const para = this.p()
    const icon = this.icon('error')
    const span = this.span()
    para.className = 'error'
    para.dataset.label = who
    para.hidden = true
    para.append(icon)
    para.append(span)
    return para
  }
  , formField (...params) {
    const [tag, title, text, type] = params
    const label = this.label()
    const field = this[tag]()
    const error = this.errorLine(title)
    field.id = title
    if (type) field.type = type
    label.className = title 
    label.for = title
    label.append(text, field, error)
    return label
  }
  , icon (...params) {
    const span = this.span()
    const [symbol, aria] = params
    span.className = 'material-symbols-outlined'
    span.ariaLabel = aria || symbol
    span.textContent = symbol
    return span
  }
  , iconButton (...params) {
    const button = this.button()
    const icon = this.span()
    const [symbol, aria] = params
    icon.className = 'material-symbols-outlined'
    icon.ariaLabel = aria || symbol
    icon.textContent = symbol
    button.title = aria
    button.append(icon)
    return button
  }
  , ruleBox () {
    const box = this.div()
    const title = this.h4()
    box.className = 'pw-rules'
    title.textContent = 'Remember to incorporate:'
    box.append(title)
    pwRules.forEach((rule) => {
      const para = this.p()
      const icon = this.icon('close', 'rule')
      para.className = 'rule'
      para.append(icon, rule)
      box.append(para)
    })
    box.hidden = true
    return box
  }
  , selectOption (value, text) {
    const option = this.option()
    option.value = value
    option.textContent = text
    return option
  }
}
const pwRules = [
  '8 to 20 characters'
  , 'uppercase and lowercase'
  , 'numbers'
  , 'special characters'
]
const tags = [
  'button'
  , 'div'
  , 'form'
  , 'h4'
  , 'input'
  , 'label'
  , 'option'
  , 'p'
  , 'select'
  , 'span'
]
const { validatePostalCode } = usePostalCodeValidation()

tags.forEach((tag) => {
  creator[tag] = function () {
    return this.element(tag)
  }
})

function buildForm () {
  const form = creator.form()
  const email = creator.formField('input', 'email', 'email', 'email')
  const country = creator.formField('select', 'country', 'country')
  const countrySelect = country.querySelector('select')
  const option = creator.selectOption('', 'select country')
  const code = creator.formField('input', 'pcode', 'postal code')
  const pw = creator.formField('input', 'password', 'password', 'password')
  const pwConf = creator.formField(
    'input'
    , 'password-conf'
    , 'confirm password'
    , 'password'
  )
  const ruleBox = creator.ruleBox()
  const submit = creator.button()
  const showPW = creator.iconButton('visibility', 'display password')
  const hidePW = creator.iconButton('visibility_off', 'hide password')

  form.toggleAttribute('novalidate')

  code.firstElementChild.disabled = true

  pwConf.firstElementChild.disabled = true

  submit.type = 'submit'
  submit.textContent = 'submit'
  submit.disabled = true
  submit.title = 'Complete all fields'

  showPW.id = 'show-pw'

  hidePW.hidden = true
  hidePW.id = 'hide-pw'

  countrySelect.append(option)
  countries.forEach((nation) => {
    const opt = creator.selectOption(nation.countryCode, nation.countryName)
    countrySelect.append(opt)
  })
  pw.append(ruleBox)
  form.append(email, country, code, pw, pwConf, submit, showPW, hidePW)

  return form
}

document.body.append(buildForm())

const listeners = (() => {
  const email = document.getElementById('email')
  const country = document.getElementById('country')
  const code = document.getElementById('pcode')
  const password = document.getElementById('password')
  const pwConf = document.getElementById('password-conf')
  const ruleBox = document.querySelector('.pw-rules')
  const showPW = document.getElementById('show-pw')
  const hidePW = document.getElementById('hide-pw')

  email.addEventListener('input', () => {
    const message = validateEmail(email)
    const errLine = document.querySelector('#email + .error')
    const errMsg = errLine.querySelector('span + span')
    if (message) {
      errLine.hidden = false
      errLine.classList.add('active')
      errMsg.textContent = message
    } else {
      errLine.hidden = true
      errLine.classList.remove('active')
    }
  })
  country.addEventListener('change', () => {
    const selected = getCountryByCode(country.value)
    code.placeholder = ''
    code.disabled = true
    if (selected) {
      code.disabled = false
      const phText = selected.examplePostalCodes.length
        ? `e.g., ${selected.examplePostalCodes}`
        : ''
      code.placeholder = phText
      setCodeError(phText)
    }
  })
  code.addEventListener('input', () => {
    const selected = country.value
    const message = validateCode(code, selected)
    const errLine = document.querySelector('#pcode + .error')
    const errMsg = errLine.querySelector('span + span')
    if (message) {
      errLine.hidden = false
      errLine.classList.add('active')
      errMsg.textContent = message
    } else {
      errLine.hidden = true
      errLine.classList.remove('active')
    }
  })
  password.addEventListener('focus', () => ruleBox.hidden = false)
  password.addEventListener('input', () => {
    const message = validatePassword(password)
    const errLine = document.querySelector('#password + .error')
    const errMsg = errLine.querySelector('span + span')
    if (message) {
      errLine.hidden = false
      errLine.classList.add('active')
      errMsg.textContent = message
    } else {
      errLine.hidden = true
      errLine.classList.remove('active')
    }
  })
  pwConf.addEventListener('input', () => {
    const message = validatePassMatch(pwConf, password.value)
    const errLine = document.querySelector('#password-conf + .error')
    const errMsg = errLine.querySelector('span + span')
    if (message) {
      errLine.hidden = false
      errLine.classList.add('active')
      errMsg.textContent = message
    } else {
      errLine.hidden = true
      errLine.classList.remove('active')
    }
  })
  password.addEventListener('blur', () => {
    ruleBox.hidden = true
  })
  showPW.addEventListener('click', (e) => {
    e.preventDefault()
    password.type = 'text'
    pwConf.type = 'text'
    hidePW.hidden = false
    showPW.hidden = true
  })
  hidePW.addEventListener('click', (e) => {
    e.preventDefault()
    password.type = 'password'
    pwConf.type = 'password'
    hidePW.hidden = true
    showPW.hidden = false
  })
})()

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

function validateCode (node, testParam) {
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

function validateEmail (node) {
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

function validatePassMatch (node, string) {
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

function validatePassword (node) {
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