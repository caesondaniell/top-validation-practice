import { getAllCountries, getCountryByCode } from 'postal-code-checker'
import * as validate from './validate.js'

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
  const form = document.querySelector('form')
  const email = document.getElementById('email')
  const country = document.getElementById('country')
  const code = document.getElementById('pcode')
  const password = document.getElementById('password')
  const pwConf = document.getElementById('password-conf')
  const ruleBox = document.querySelector('.pw-rules')
  const showPW = document.getElementById('show-pw')
  const hidePW = document.getElementById('hide-pw')
  const submit = document.querySelector('button[type="submit"]')
  const codeEvents = ['input', 'focus']

  email.addEventListener('input', () => {
    const message = validate.email(email)
    activateError('email', message)
  })
  email.addEventListener('blur', () => validate.blankField(email))
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
      validate.setCodeError(phText)
      code.focus()
    }
  })
  country.addEventListener('blur', validate.blankCountry)
  codeEvents.forEach((eventType) => {
      code.addEventListener(eventType, () => {
      const selected = country.value
      const message = validate.code(code, selected)
      activateError('pcode', message)
    })
  })
  code.addEventListener('blur', () => validate.blankField(code))
  password.addEventListener('focus', () => ruleBox.hidden = false)
  password.addEventListener('input', () => {
    const message = validate.password(password)
    activateError('password', message)
  })
  password.addEventListener('blur', () => {
    ruleBox.hidden = true
    validate.blankField(password)
  })
  pwConf.addEventListener('input', () => {
    const message = validate.passMatch(pwConf, password.value)
    activateError('password-conf', message)
  })
  pwConf.addEventListener('blur', () => validate.blankField(pwConf))
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
  form.addEventListener('input', () => {
    submit.disabled = validate.form(form) ? false : true
  })
  form.addEventListener('change', () => {
    submit.disabled = validate.form(form) ? false : true
  })
  submit.addEventListener('click', (e) => e.preventDefault())

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
})()