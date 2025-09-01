from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# uvicorn runs by default on port 8000

# instance of fastapi
app = FastAPI()

# middleware to allow frontend files to connect to this application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static_test", StaticFiles(directory="static_test"), name="static_test")

class Item(BaseModel):
    name: str
    price: float
    description: Optional[str] = None # optional

# in-memory storage, youd use a database instead in real apps
items = []
next_id = 1

# home page
@app.get("/", response_class=HTMLResponse)
def root():
    return {"message": "API is running! Visit /static_test/test_templates/test.html for the frontend!"}

# update items
@app.post("/items/")
def create_items(item: Item):
   global next_id

   new_item = {
       "id": next_id,
       **items.dict()
   }

   items.append(new_item)
   next_id += 1

   return {
       "message": "Item created successfully",
       "item": new_item
   }

# items page
@app.get("/items/")
def get_all_items():
    return {"items": items, "total": len(items)}

# delete item
@app.delete("/api/items/{item_id}")
def delete_item(item_id: int):
    global items
    original_count = len(items)

    # loops through all items in item list, skips specified item
    items = [item for item in items if item["id"] != item_id]
    
    if len(items) == original_count:
        return {"error": "Item not found"}, 404
    
    if len(items) == original_count:
        raise HTTPException(status_code=404, detail="Item not found")
    
