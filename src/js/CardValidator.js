import amexIcon from '../img/amex.svg'
import dinersIcon from '../img/diners.svg'
import discoverIcon from '../img/discover.svg'
import jcbIcon from '../img/jcb.svg'
import mastercardIcon from '../img/mastercard.svg'
import mirIcon from '../img/mir.svg'
import visaIcon from '../img/visa.svg'
import CardDetector from './CardDetector'
import LuhnAlgorithm from './LuhnAlgorithm'

export default class CardValidator {
  constructor(container) {
    this.container = container
    this.input = null
    this.cardIcons = null
    this.init()
  }

  init() {
    this.render()
    this.attachEventListeners()

    // Создаёт модальное окно
    this.createModal()
  }

  render() {
    this.container.innerHTML = `
      <div class="card-validator">
        <div class="card-icons">
          <div class="card-icon" data-card="visa">
            <img src="${visaIcon}" alt="Visa">
          </div>
          <div class="card-icon" data-card="mastercard">
            <img src="${mastercardIcon}" alt="Mastercard">
          </div>
          <div class="card-icon" data-card="amex">
            <img src="${amexIcon}" alt="American Express">
          </div>
          <div class="card-icon" data-card="discover">
            <img src="${discoverIcon}" alt="Discover">
          </div>
          <div class="card-icon" data-card="jcb">
            <img src="${jcbIcon}" alt="JCB">
          </div>
          <div class="card-icon" data-card="diners">
            <img src="${dinersIcon}" alt="Diners Club">
          </div>
          <div class="card-icon" data-card="mir">
            <img src="${mirIcon}" alt="МИР">
          </div>
        </div>
        <div class="input-group">
          <input 
            type="text" 
            class="card-input" 
            placeholder="Введите номер карты"
            maxlength="24"
          >
          <button class="validate-btn">Проверить</button>
        </div>
      </div>
    `

    this.input = this.container.querySelector('.card-input')
    this.cardIcons = this.container.querySelectorAll('.card-icon')
    this.validateBtn = this.container.querySelector('.validate-btn')
  }

  attachEventListeners() {
    // Форматирование: цифры по 4 с пробелом
    this.input.addEventListener('input', () => {
      this.formatCardInput()
      this.highlightCardType()
    })

    // Валидация по клику
    this.validateBtn.addEventListener('click', () => {
      this.validateCard()
    })

    // Валидация по Enter
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.validateCard()
      }
    })
  }

  /** Оставляет только цифры и разбивает по 4 с пробелом */
  formatCardInput() {
    const raw = this.input.value
    const digitsBeforeCursor = raw.slice(0, this.input.selectionStart).replace(/\D/g, '').length
    const digits = raw.replace(/\D/g, '')
    const formatted = digits.match(/.{1,4}/g)?.join(' ') ?? ''
    this.input.value = formatted
    let pos = 0
    let count = 0
    for (const ch of formatted) {
      if (count >= digitsBeforeCursor) break
      pos++
      if (/\d/.test(ch)) count++
    }
    this.input.setSelectionRange(pos, pos)
  }

  highlightCardType() {
    const cardNumber = this.input.value
    const detectedCard = CardDetector.detect(cardNumber)

    // Сбрасывает все подсветки
    this.cardIcons.forEach(icon => {
      icon.classList.remove('active', 'inactive')
    })

    if (detectedCard) {
      // Подсвечивает определенную карту и затемняем остальные
      this.cardIcons.forEach(icon => {
        if (icon.dataset.card === detectedCard) {
          icon.classList.add('active')
        } else {
          icon.classList.add('inactive')
        }
      })
    }
  }

  validateCard() {
    const cardNumber = this.input.value

    // Удаляет предыдущие классы состояния
    this.input.classList.remove('valid', 'invalid')

    const modalText = this.modal.querySelector('.modal-text')
    const modalButton = this.modal.querySelector('.modal-button')

    if (!cardNumber.trim()) {
      modalText.textContent = `Введите номер карты`
      this.modal.classList.add('modal-visible')

      // Обработчик кнопки для пустого ввода
      modalButton.onclick = () => {
        this.modal.classList.remove('modal-visible')
        this.input.value = ''
        this.input.focus()
      }
      return
    }

    const isValid = LuhnAlgorithm.validate(cardNumber)
    const cardType = CardDetector.detect(cardNumber)

    if (isValid) {
      this.input.classList.add('valid')
      const cardName = cardType ? cardType.toUpperCase() : 'Unknown'
      modalText.textContent = `✓ Номер карты валиден!\nПлатежная система: ${cardName}`
      this.modal.classList.add('modal-visible')
    } else {
      this.input.classList.add('invalid')
      modalText.textContent = `✗ Номер карты невалиден!`
      this.modal.classList.add('modal-visible')
    }

    // Обработчик кнопки перезапуска
    modalButton.onclick = () => {
      this.modal.classList.remove('modal-visible')
      this.input.value = ''
      this.input.classList.remove('valid', 'invalid')
      this.cardIcons.forEach(icon => {
        icon.classList.remove('active', 'inactive')
      })
      this.input.focus()
    }
  }

  // Создает модальное окно
  createModal() {
    const modal = document.createElement('div')
    modal.classList.add('modal')
    modal.innerHTML = `
            <div class="modal-content">
                <p class="modal-text"></p>
                <button class="modal-button">Ввести заново</button>
            </div>
        `
    document.body.append(modal)
    this.modal = modal
  }
}