import Web3 from "web3";
import LPToken from "../abi/LPToken.json";
import ERC20 from "../abi/ERC20.json";


export default class Price{
	constructor(pOption) {

		this.orfanoAddress = '0xef2ec90e0b8d4cdfdb090989ea1bc663f0d680bf';
		this.bnbAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
		this.lpAddress = '0x98dE283a561f76096B5C4df10C0C7f75A9fCb029'; 
		this.setPriceMethod = pOption.setPriceMethod
    }

	getPrice(){
		const provider = new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/");
		const web3 = new Web3(provider);
		const orfanoToken = new web3.eth.Contract(ERC20, this.orfanoAddress);
		console.log(orfanoToken,'this is the orfanoToken')
		const bnbToken = new web3.eth.Contract(ERC20, this.bnbAddress);
		orfanoToken.methods.totalSupply().call().then((res)=>{
			this.setPriceMethod(res)
		});
		
		const lpToken = new web3.eth.Contract(LPToken, this.lpAddress);
		console.log(lpToken,'this is the lptoken')
	}	
}

	
	// const account = accounts.toString();
// 	const lpToken = new web3.eth.Contract(LPToken, lpAddress);
	

// 	const orfanoBalance = await orfanoToken.methods.balanceOf(lpAddress).call();
// 	const bnbBalance = await bnbToken.methods.balanceOf(lpAddress).call();

// 	const api = 'https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=4T3F6MQAQXFKW8D14RFHI2I5V394DQXAGH';
// 	const response = await fetch(api);
// 	const res = await response.json();
//   const bnbPrice = res.result.ethusd;
//   const wbnbPrice = bnbPrice * 0.996016;

  // console.log('pooh, bnbPrice = ', bnbPrice);
	// console.log("pooh windBalance = ", windBalance / 100000000);
	// console.log("pooh bnbBalance = ", bnbBalance / 1000000000000000000);
	// console.log("pooh token price = ", bnbBalance / windBalance * wbnbPrice / 10000000000);
	// const tokenPrice = bnbBalance / orfanoBalance * wbnbPrice / 10000000000;



