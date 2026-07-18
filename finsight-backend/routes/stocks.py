from fastapi import APIRouter, Query
from typing import Optional
import schemas
from stock_utils import fetch_stock_price, DEFAULT_STOCKS

router = APIRouter(prefix="/stocks", tags=["Stocks"])

@router.get("", response_model=schemas.StockListResponse)
async def list_stocks(symbol: Optional[str] = Query(None)):
    if not symbol:
        # Return all default/pre-defined stocks
        stock_list = []
        for sym in DEFAULT_STOCKS.keys():
            live_data = await fetch_stock_price(sym)
            stock_list.append(live_data)
        return {"stocks": stock_list}
    
    # User searched for a specific symbol/name
    search_term = symbol.upper().strip()
    
    # 1. Search in local default dictionary first
    matched_keys = [k for k in DEFAULT_STOCKS.keys() if search_term in k or search_term in DEFAULT_STOCKS[k]["name"].upper()]
    
    if matched_keys:
        stock_list = []
        for key in matched_keys:
            live_data = await fetch_stock_price(key)
            stock_list.append(live_data)
        return {"stocks": stock_list}
    
    # 2. If no direct local match, try querying Yahoo Finance for it directly!
    try:
        live_data = await fetch_stock_price(search_term)
        # Verify if the fetched price is a valid match, not a dummy
        if live_data["price"] != 100.0 or live_data["symbol"] == search_term:
            return {"stocks": [live_data]}
    except Exception:
        pass
        
    return {"stocks": []}
