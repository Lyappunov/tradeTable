
export default class BitQueryApi {
  constructor(options) {
    
    this.debug = options.debug || false
    this.bitQueryData = options.apiData
  }

  binanceSymbols() {
   const symbols = this.bitQueryData
    return symbols;
  }
 
  binanceKlines(from, to, limit) {
    const klines = this.bitQueryData
    let bars = [];
    var k=0
			klines.ethereum.dexTrades.forEach(bar => {
        
        if(k<=limit){
          var datetime = new Date(bar.timeInterval.minute)
          var dateTimeMili = datetime.getTime()
          
          if (dateTimeMili >= from && dateTimeMili < to ) {
            // bars.push(bar)
            k=k+1;
            bars = [...bars, bar]
          }
        }
			});
      return bars;
  }
  generateSymbol(exchange, fromSymbol, toSymbol) {
    const short = `${fromSymbol}/${toSymbol}`;
    return {
      short,
      full: `${exchange}:${short}`,
    };
  }
 getAllSymbols() {
    // const data = await makeApiRequest('data/v3/all/exchanges');
    const data = this.bitQueryData
    let allSymbols = [];
    // console.log(data.ethereum[configurationData.exchanges[0].value])
    
      const poocoinData = data.ethereum.dexTrades;
        const symbols = poocoinData.map((pd) => {
          const symbol = this.generateSymbol('Pancake', pd.baseCurrency.symbol, pd.quoteCurrency.symbol);
          return {
            symbol: symbol.short,
            full_name: symbol.full,
            description: symbol.short,
            exchange: 'Pancake',
            type: 'currency',
            currency_code: pd.quoteCurrency.symbol
          };
        });
        allSymbols = [...allSymbols, ...symbols];
 
    return allSymbols;
  }
  
  onReady(callback) {
    
      this.symbols = this.binanceSymbols();
      setTimeout(() => callback(
        {
          supports_marks: false,
          supports_timescale_marks: false,
          supports_time: true,
          supported_resolutions: [
            '1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'
          ]
        }
      ));
    
  }
  
  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    userInput = userInput.toUpperCase()
    onResultReadyCallback(

      this.symbols.ethereum.dexTrades.filter((symbol) => {
        return symbol.indexOf(userInput) >= 0
      }).map((symbol) => {
        return {
          symbol: symbol.baseCurrency.symbol + symbol.quoteCurrency.symbol,
          full_name: symbol.baseCurrency.symbol + symbol.quoteCurrency.symbol,
          description: symbol.baseAsset + ' / ' + symbol.quoteAsset,
          ticker: symbol.baseCurrency.symbol + symbol.quoteCurrency.symbol,
          exchange: 'dexTrade',
          type: 'currency'
        }
      })
    )
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    // const symbolsItems = this.symbols.ethereum.dexTrades;
    const symbolsItems = this.getAllSymbols();
    for (let symbol of symbolsItems) {
      
      if (symbol.full_name == symbolName) {
        setTimeout(() => {
          onSymbolResolvedCallback({
            name: symbol.symbol,
            description: symbol.description,
            ticker: symbol.full_name,
            exchange: symbol.description,
            listed_exchange: symbol.description,
            type: symbol.type,
            session: '24x7',
            minmov: 1,
            pricescale: 1,
            timezone: 'Etc/UTC',
            has_intraday: true,
            has_daily: true,
            has_weekly_and_monthly: true,
            currency_code: symbol.currency_code,
            supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'],
            volume_precision: 2,
            data_status: 'streaming'
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

    const finishKlines = () => {
      if (this.debug) {
        console.log('📊:', totalKlines.length)
      }

      if (totalKlines.length == 0) {
        onHistoryCallback([], { noData: true })
      } else {
        onHistoryCallback(totalKlines.map(kline => {
          var datetime = new Date(kline.timeInterval.minute)
          var dateTimeMili = datetime.getTime()
          return {
            time: dateTimeMili,
            close: kline.close_price,
            open: kline.open_price,
            high: kline.maximum_price,
            low: kline.minimum_price,
            volume:2
          }
        }), {
          noData: false
        })
      }
    }

    const getKlines = (from, to) => {
      var klines = this.binanceKlines(from, to, 100)
      
        totalKlines = totalKlines.concat(klines)
        if (klines.length >= 100) {
          var datetime = new Date(klines[klines.length - 1].timeInterval.minute)
          var dateTimeMili = datetime.getTime()
          from = dateTimeMili + 2
          getKlines(from, to)
        } else {
        
          finishKlines()
        }
          
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
    var symbolsfortime = this.binanceSymbols();
    var length = symbolsfortime.ethereum.dexTrades.length
    
    var serverTime = symbolsfortime.ethereum.dexTrades[length-1].timeInterval.minute
   
    var datetime = new Date(serverTime)
    var dateTimeMili = datetime.getTime()
      setTimeout(() => callback(
        Math.floor(dateTimeMili / 1000)
      ));
  }
}
