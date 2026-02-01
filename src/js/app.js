import '../css/style.css'
import CardValidator from './CardValidator'

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#app')
    new CardValidator(container)
})