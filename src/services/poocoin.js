import App,{ dateRangeGlobal} from "../pages/Home"
export default class Poocoin {
    constructor(pOption) {

        this.dateRange = dateRangeGlobal
        this.queryData = null
        this.labeltitle = ''
        console.log(pOption);
        this.state = {
            intervalId:null,
            data:null
      }
    
    };
    
    async loadBitqueryData(startTime, endTime) {

        
        const toJSON = JSON.stringify;

        const query = `
    {
      ethereum(network: bsc) {
        dexTrades(
          options: {asc: "timeInterval.minute", limit: 1010}
          exchangeName: {is: "Pancake"}
          time: {since: ${toJSON(toISODateTime(startTime))}, till: ${toJSON(toISODateTime(endTime))}}
          baseCurrency: {in: ["0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"]}
          quoteCurrency: {in: ["0xef2ec90e0b8d4cdfdb090989ea1bc663f0d680bf","0xe9e7cea3dedca5984780bafc599bd69add087d56"]}
        ) {
          timeInterval {
            minute(count: 15)
          }
          exchange {
            name
          }
          
          baseCurrency {
            address
            symbol
          }
          quoteCurrency {
            address
            symbol
          }
          USD: tradeAmount(in: USD, calculate: sum)
          Txs: count
          maximum_price: quotePrice(calculate: maximum)
          minimum_price: quotePrice(calculate: minimum)
          open_price: minimum(of: block, get: quote_price)
          close_price: maximum(of: block, get: quote_price)
        }
      }
    }`;

    
        const res = await fetch('https://graphql.bitquery.io', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json; charset=utf-8',
                'X-API-KEY': 'BQYvhnv04csZHaprIBZNwtpRiDIwEIW9',
            }),
            body: JSON.stringify({ query }),
            mode: 'cors',
        });
        return await res.json();

        function toISODateTime(t) {
            return new Date(t).toISOString();
        }

        function toISODate(t) {
            return toISODateTime(t).split('T')[0];
        }
    }

   generateSymbol(exchange, fromSymbol, toSymbol) {
        const short = `${fromSymbol}/${toSymbol}`;
        return {
            short,
            full: `${exchange}:${short}`,
            currency_code: `${fromSymbol}`
        };
    }

    onReady(callback) {

        let allSymbols = [];
        this.loadBitqueryData(...this.dateRange).then(klines => {
            this.queryData = klines
            const symbols = klines.data.ethereum.dexTrades.map(pd => {
                if (pd.quoteCurrency.symbol !== "BUSD") {
                    const symbol = this.generateSymbol('Pancake', pd.quoteCurrency.symbol, pd.baseCurrency.symbol);
                    return {
                        symbol: symbol.short,
                        full_name: symbol.full,
                        description: symbol.short,
                        exchange: 'Pancake',
                        type: 'currency',
                        currency_code: symbol.currency_code
                    };
                }
                
            });
            allSymbols = [...allSymbols, ...symbols];
            this.symbols = symbols
            callback({
                supports_marks: false,
                supports_timescale_marks: false,
                supports_time: true,
                supported_resolutions: [
                    '1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'
                ]
            })

        });
    }

    searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
        console.log(exchange,'exchange')
        userInput = userInput.toUpperCase()
        onResultReadyCallback(
            this.symbols.filter((symbol) => {
                return symbol.symbol.indexOf(userInput) >= 0
            }).map((symbol) => {
                return {
                    symbol: symbol.symbol,
                    full_name: symbol.symbol,
                    description: symbol.full_name,
                    ticker: symbol.symbol,
                    exchange: exchange,
                    type: 'crypto'
                }
            })
        )
    }

    resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
        this.debug && console.log('👉 resolveSymbol:', symbolName)

        const comps = symbolName.split(':')
        symbolName = (comps.length > 1 ? comps[1] : symbolName).toUpperCase()

        function pricescale(symbol) {
            if (typeof symbol.filters !== 'undefined') {
                for (let filter of symbol.filters) {
                    if (filter.filterType == 'PRICE_FILTER') {
                        return Math.round(1 / parseFloat(filter.tickSize))
                    }
                }
            }
            return 1
        }

        for (let symbol of this.symbols) {
            if (symbol.symbol == symbolName) {
                setTimeout(() => {
                    onSymbolResolvedCallback({
                        name: symbol.symbol,
                        description: symbol.full_name,
                        ticker: symbol.symbol,
                        exchange: 'Pancake',
                        listed_exchange: 'Pancake',
                        type: 'crypto',
                        session: '24x7',
                        minmov: 1,
                        pricescale: 1000000000000,
                        volume_precision: 8,
                        timezone: 'UTC',
                        has_intraday: true,
                        has_no_volume: false,
                        has_daily: false,
                        has_weekly_and_monthly: true,
                        intraday_multipliers: ['1', '60'],
                    })
                }, 0)
                return
            }
        }

        onResolveErrorCallback('not found')
    }

    getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
        if (this.debug) {
            console.log('👉 getBars:', symbolInfo.name, resolution)
            console.log('First:', firstDataRequest)
            console.log('From:', from, '(' + new Date(from * 1000).toGMTString() + ')')
            console.log('To:  ', to, '(' + new Date(to * 1000).toGMTString() + ')')
        }

        const interval = {
            '1': '1m',
            '3': '3m',
            '5': '5m',
            '15': '15m',
            '30': '30m',
            '60': '1h',
            '120': '2h',
            '240': '4h',
            '360': '6h',
            '480': '8h',
            '720': '12h',
            'D': '1d',
            '1D': '1d',
            '3D': '3d',
            'W': '1w',
            '1W': '1w',
            'M': '1M',
            '1M': '1M',
        }[resolution]

        if (!interval) {
            onErrorCallback('Invalid interval')
        }

        let totalKlines = []
        let totalBUKlines = []

        const finishKlines = () => {
            if (this.debug) {
                console.log('📊:', totalKlines.length)
            }

            if (totalKlines.length == 0) {
                onHistoryCallback([], { noData: true })
            } else {
                let busdArray = [];
                let orfanoArray = [];
                    
                totalKlines.map(tkl => {
                    if(tkl.quoteCurrency.symbol === "ORFANO"){
                        orfanoArray.push(tkl)
                    } else if(tkl.quoteCurrency.symbol === "BUSD"){
                        busdArray.push(tkl)
                    }
                })
                busdArray.sort((a,b)=> new Date(a.timeInterval.minute).getTime() - new Date(b.timeInterval.minute).getTime())
                orfanoArray.sort((a,b)=> new Date(a.timeInterval.minute).getTime() - new Date(b.timeInterval.minute).getTime())

                onHistoryCallback(orfanoArray.map((kl, index) => {
                    
                    var datetime = new Date(kl.timeInterval.minute)
                    var dateTimeMili = datetime.getTime()

                    var orfanoValue_close = parseFloat(kl.close_price)
                    var orfanoValue_open = parseFloat(kl.open_price)
                    var orfanoValue_high = parseFloat(kl.maximum_price)
                    var orfanoValue_low = parseFloat(kl.minimum_price)

                    var closeValue = (parseFloat(busdArray[index].close_price)/orfanoValue_close*(1-0.0644)).toFixed(12)
                    var openValue = (parseFloat(busdArray[index].open_price)/orfanoValue_open*(1-0.0644)).toFixed(12)
                    var lowValue = (parseFloat(busdArray[index].maximum_price)/orfanoValue_high*(1-0.0644)).toFixed(12)
                    var highValue = (parseFloat(busdArray[index].minimum_price)/orfanoValue_low*(1-0.0644)).toFixed(12)
                    // console.log(busdArray[index].maximum_price,'/',kl.maximum_price,' date: ', kl.timeInterval.minute)
                    // console.log(closeValue,'-C-',openValue,'-O-',highValue,'-H-',lowValue,'-L-')
                    
                    return {
                        time: dateTimeMili,
                        close: closeValue,
                        open: openValue,
                        high: highValue,
                        low: lowValue,
                        volume: parseFloat(kl.USD)
                    }
                    
                }), {
                    noData: false
                })
            }
        }


    const getKlines = (from, to) => {
          this.loadBitqueryData(from, to).then(klines => {
            var bumpKlines = klines.data.ethereum.dexTrades
            bumpKlines.map(bk=>{
                if(parseFloat(bk.maximum_price)/parseFloat(bk.minimum_price)<1.6897)
                totalKlines = totalKlines.concat(bk)
            })
            

            if (bumpKlines.length == 1000) {
              from = new Date(bumpKlines[bumpKlines.length - 1].timeInterval.minute).getTime() + 1
              getKlines(from, to)
            } else {
              finishKlines()
            }
          }).catch(err => {
            console.error(err)
            onErrorCallback('Some problem')
          })

        
        }

        from *= 1000
        to *= 1000

        getKlines(from, to)
    }

    subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
        this.debug && console.log('👉 subscribeBars:', subscriberUID)
    }

    unsubscribeBars(subscriberUID) {
        this.debug && console.log('👉 unsubscribeBars:', subscriberUID)
    }

    getServerTime(callback) {
        const dateRange = dateRangeGlobal

        var serverTime = dateRange[1]

        var datetime = new Date(serverTime)
        console.log(datetime)
        var dateTimeMili = datetime.getTime()
        setTimeout(() => callback(
            Math.floor(dateTimeMili / 1000)
        ));
    }
}