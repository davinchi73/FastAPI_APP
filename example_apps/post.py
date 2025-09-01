from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

# uvicorn runs by default on port 8000

# instance of fastapi
app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    description: Optional[str] = None # optional

class ItemResponse(BaseModel):
    id: int
    name: str
    price: float
    description: Optional[str] = None
    category = str
    message = str


# in-memory storage, youd use a database instead in real apps
items = []
next_id = 1

@app.get("/")
def read_home():
    return {"Message": "Hi"}

@app.post("/items/")
def create_items(item: Item):
   global next_id

   new_item = {
       "id": next_id,
       "name": item.name,
       "price": item.price,
       "description": item.description,
       "category": item.category
   }

   items.append(new_item)
   next_id += 1

   return {
       "message": "Item created successfully",
       "item": new_item
   }

@app.post("/items/", response_model=ItemResponse)
def create_item_with_response_model(item: Item):
    global next_id

    new_item_data = {
        "id": next_id,
        **items.dict(), # dictionary unpacking
        "message": "Item created with response model"
    }

    items.append(new_item_data)
    next_id += 1

    return new_item_data

@app.post("/categories/{category_name}/items/")
def create_item_in_category(category_name: str, item: Item):
    global next_id

    new_item = {
        "id": next_id,
        "name": item.name,
        "price": item.price,
        "description": item.description,
        "category": category_name
    }

    items.append(new_item)
    next_id += 1

    return {
        "message": f"Item created in category: {category_name}",
        "item": new_item
    }

@app.get("/items/")
def get_all_items():
    return {"items": items, "total": len(items)}
