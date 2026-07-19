import httpx
import logging

logger = logging.getLogger("finsight-backend")

# Static list of supported/fallback stocks
DEFAULT_STOCKS = {
    "RELIANCE": {"name": "Reliance Industries Ltd.", "price": 2847.0, "change": 1.4, "exchange": "NSE"},
    "TCS": {"name": "Tata Consultancy Services Ltd.", "price": 3910.0, "change": 2.1, "exchange": "NSE"},
    "INFY": {"name": "Infosys Ltd.", "price": 1523.0, "change": -0.8, "exchange": "NSE"},
    "HDFCBANK": {"name": "HDFC Bank Ltd.", "price": 1682.0, "change": 0.5, "exchange": "NSE"},
    "WIPRO": {"name": "Wipro Ltd.", "price": 456.0, "change": -1.2, "exchange": "NSE"},
    "BAJFINANCE": {"name": "Bajaj Finance Ltd.", "price": 6834.0, "change": 3.1, "exchange": "NSE"},
    "ICICIBANK": {"name": "ICICI Bank Ltd.", "price": 1124.0, "change": 0.9, "exchange": "NSE"},
    "AAPL": {"name": "Apple Inc.", "price": 180.5, "change": 0.45, "exchange": "NASDAQ"},
    "NVDA": {"name": "NVIDIA Corporation", "price": 875.2, "change": 2.8, "exchange": "NASDAQ"},
    "MSFT": {"name": "Microsoft Corporation", "price": 420.1, "change": -0.12, "exchange": "NASDAQ"},
}

async def fetch_stock_price(symbol: str) -> dict:
    """
    Attempts to fetch live stock price and percentage change from Yahoo Finance.
    Falls back to a static list if it fails or if the stock is not found.
    """
    sym = symbol.upper().strip()
    
    # Try fetching from Yahoo Finance
    # Try suffixing with .NS if it looks like an Indian stock (non-US)
    suffixes = ["", ".NS"] if len(sym) > 4 else ["", ".NS"]
    if sym in ["RELIANCE", "TCS", "INFY", "HDFCBANK", "WIPRO", "BAJFINANCE", "ICICIBANK"]:
        suffixes = [".NS", ""] # Prefer .NS for Indian index stocks

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    async with httpx.AsyncClient() as client:
        for suffix in suffixes:
            query_sym = f"{sym}{suffix}"
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{query_sym}"
            try:
                response = await client.get(url, headers=headers, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    meta = data.get("chart", {}).get("result", [{}])[0].get("meta", {})
                    price = meta.get("regularMarketPrice")
                    prev_close = meta.get("chartPreviousClose")
                    
                    if price is not None:
                        change = 0.0
                        if prev_close:
                            change = ((price - prev_close) / prev_close) * 100.0
                        
                        exchange = "NSE" if suffix == ".NS" else meta.get("exchangeName", "US")
                        name = meta.get("longName") or DEFAULT_STOCKS.get(sym, {}).get("name") or sym
                        
                        return {
                            "symbol": sym,
                            "name": name,
                            "price": round(price, 2),
                            "change": round(change, 2),
                            "exchange": exchange
                        }
            except Exception as e:
                logger.error(f"Yahoo Finance fetch error for {query_sym}: {e}")
                
    # Fallback to local dictionary or default values
    if sym in DEFAULT_STOCKS:
        stock_data = DEFAULT_STOCKS[sym]
        return {
            "symbol": sym,
            "name": stock_data["name"],
            "price": stock_data["price"],
            "change": stock_data["change"],
            "exchange": stock_data["exchange"]
        }
    
    # Generic mock fallback for unknown stocks
    return {
        "symbol": sym,
        "name": f"{sym} Corporation",
        "price": 100.0,
        "change": 0.0,
        "exchange": "NSE"
    }
