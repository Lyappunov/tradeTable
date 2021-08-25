export function getLocalLanguage() {
    return navigator.language.split('-')[0] || 'en'
}
export const options = {
    locale: getLocalLanguage(),
    debug: false,
    fullscreen: false,
    autosize: false,
    symbol: 'Pancake:ORFANO/WBNB',
    // symbol: 'BTCUSDT',
    interval: '15',
    theme: 'dark',
    allow_symbol_change: true,
    width: 1450,
    height: 768
}