import {makeApiRequest, parseFullSymbol,} from "./helpers"
import {subscribeOnStream, unsubscribeFromStream} from './streaming.js';

const lastBarsCache = new Map();

const configurationData = {
	supported_resolutions: ['1D', '1W', '1M'],
	exchanges: [{
		value: 'Pancake',
		name: 'Pancake',
		desc: '',
	},

	
	],
	symbols_types: [{
		name: 'crypto',

		// `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
		value: 'crypto',
	},
		// ...
	],
};
function getTokenInfo(){
	return fetch('https://api.dex.guru/v1/tokens/0xef2ec90e0b8d4cdfdb090989ea1bc663f0d680bf-bsc').then(res => {
	  return res.json()
	})
  }
function generateSymbol(exchange, fromSymbol, toSymbol) {
	const short = `${fromSymbol}/${toSymbol}`;
	return {
		short,
		full: `${exchange}:${short}`,
		currency_code: `${fromSymbol}`
	};
}
async function getAllSymbols() {
	let data = null;
	let allSymbols = [];
	await fetch('https://api.dex.guru/v1/tokens/0xef2ec90e0b8d4cdfdb090989ea1bc663f0d680bf-bsc').then(result=>{
		
		data = result.json()
		console.log(data,'this is the result data')
		const symbol = generateSymbol(data.AMM, data.symbol, 'BNB');
		console.log(symbol,'this is the symbols ')
		allSymbols = [...allSymbols, ...symbol];
	});
	console.log(allSymbols,'this is the all Symbols')	
	return allSymbols;
}

export default {
	onReady: (callback) => {
		console.log('[onReady]: Method call');
		setTimeout(() => callback(configurationData));
	},

	searchSymbols: async (
		userInput,
		exchange,
		symbolType,
		onResultReadyCallback,
	) => {
		console.log('[searchSymbols]: Method call');
		const symbols = await getAllSymbols();
		const newSymbols = symbols.filter(symbol => {
			const isExchangeValid = exchange === '' || symbol.exchange === exchange;
			const isFullSymbolContainsInput = symbol.full_name
				.toLowerCase()
				.indexOf(userInput.toLowerCase()) !== -1;
			return isExchangeValid && isFullSymbolContainsInput;
		});
		onResultReadyCallback(newSymbols);
	},

	resolveSymbol: async (
		symbolName,
		onSymbolResolvedCallback,
		onResolveErrorCallback,
	) => {
		console.log('[resolveSymbol]: Method call', symbolName);
		const symbols = await getAllSymbols();
		console.log(symbols)
		const symbolItem = symbols.find(({
			full_name,
		}) => full_name === symbolName);
		if (!symbolItem) {
			console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
			onResolveErrorCallback('cannot resolve symbol');
			return;
		}
		const symbolInfo = {
			ticker: symbolItem.full_name,
			name: symbolItem.symbol,
			description: symbolItem.description,
			type: symbolItem.type,
			session: '24x7',
			timezone: 'Etc/UTC',
			exchange: symbolItem.exchange,
			minmov: 1,
			pricescale: 1000000000000,
			has_intraday: false,
			has_no_volume: true,
			has_weekly_and_monthly: false,
			supported_resolutions: configurationData.supported_resolutions,
			volume_precision: 8,
			data_status: 'streaming',
		};

		console.log('[resolveSymbol]: Symbol resolved', symbolName);
		onSymbolResolvedCallback(symbolInfo);
	},

	getBars: async (symbolInfo, resolution, from, to, firstDataRequest, onHistoryCallback, onErrorCallback) => {
		// const { from, to, firstDataRequest } = periodParams;
		console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
		const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
		const urlParameters = {
			e: parsedSymbol.exchange,
			fsym: parsedSymbol.fromSymbol,
			tsym: parsedSymbol.toSymbol,
			toTs: to,
			limit: 2000,
		};
		// const query = Object.keys(urlParameters)
		// 	.map(name => `${name}=${encodeURIComponent(urlParameters[name])}`)
		// 	.join('&');
		const query = 'symbol=0xd1587ee50e0333f0c4adcf261379a61b1486c5d2_USD&resolution=60&from=1620784083&to=1620820083&cunrrencyCode=USD'
		try {
			const data = await makeApiRequest(`v1/tradingview/history?${query}`);
			if (data.Response && data.Response === 'Error' || data.Data.length === 0) {
				// "noData" should be set if there is no data in the requested period.
				onHistoryCallback([], {
					noData: true,
				});
				return;
			}
			let bars = [];
			data.Data.forEach(bar => {
				if (bar.time >= from && bar.time < to) {
					bars = [...bars, {
						time: bar.time * 1000,
						low: bar.low,
						high: bar.high,
						open: bar.open,
						close: bar.close,
					}];
				}
			});
			if (firstDataRequest) {
				lastBarsCache.set(symbolInfo.full_name, {
					...bars[bars.length - 1],
				});
			}
			console.log(`[getBars]: returned ${bars.length} bar(s)`);
			onHistoryCallback(bars, {
				noData: false,
			});
		} catch (error) {
			console.log('[getBars]: Get error', error);
			onErrorCallback(error);
		}
	},

	subscribeBars: (
		symbolInfo,
		resolution,
		onRealtimeCallback,
		subscribeUID,
		onResetCacheNeededCallback,
	) => {
		console.log('[subscribeBars]: Method call with subscribeUID:', subscribeUID);
		subscribeOnStream(
			symbolInfo,
			resolution,
			onRealtimeCallback,
			subscribeUID,
			onResetCacheNeededCallback,
			lastBarsCache.get(symbolInfo.full_name),
		);
	},

	unsubscribeBars: (subscriberUID) => {
		console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
		unsubscribeFromStream(subscriberUID);
	},
};
