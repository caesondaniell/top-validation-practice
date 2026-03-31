import { getAllCountries, getCountryByCode } from 'postal-code-checker'

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

function addListeners () {
  const country = document.getElementById('country')
  const code = document.getElementById('pcode')
  const password = document.getElementById('password')
  const pwConf = document.getElementById('password-conf')
  const ruleBox = document.querySelector('.pw-rules')
  const showPW = document.getElementById('show-pw')
  const hidePW = document.getElementById('hide-pw')
  const submit = document.querySelector('button[type="submit"]')

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
    }
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
  submit.addEventListener('click', (e) => e.preventDefault())
}

export function renderForm () {
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

  submit.type = 'submit'
  submit.textContent = 'submit'

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
  document.body.append(form)

  addListeners()
}