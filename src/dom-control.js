import { getAllCountries } from 'postal-code-checker'

const countries = getAllCountries()
const creator = {
  element (tag) { return document.createElement(tag) }
  , errorSpan (who) {
    const icon = this.icon('error')
    const span = this.span()
    span.className = 'error'
    span.dataset.label = who
    span.hidden = true
    span.append(icon)
    return span
  }
  , formField (...params) {
    const [tag, title, text, type] = params
    const label = this.label()
    const field = this[tag]()
    const error = this.errorSpan()
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

  form.toggleAttribute('novalidate')

  submit.type = 'submit'
  submit.textContent = 'submit'

  pw.append(ruleBox)
  form.append(email, country, code, pw, pwConf, submit)

  return form
}

document.body.append(buildForm())