from fastapi import FastAPI
from pydantic import BaseModel

# uvicorn runs by default on port 8000

# instance of fastapi
app = FastAPI()


class Item(BaseModel):
    name: str
    price: float
    description: str = None # optional

# in-memory storage, youd use a database instead in real apps
items = []

@app.post("/items")
def create_items(item: Item):
    # add a new item to our local storage
    new_item = {"id": len(items) + 1, **items.dict()}
    items.append(new_item)
    return {"message": "Item created", "item": new_item}