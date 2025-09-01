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

# "/" is the root url of the app
@app.get("/")
def read_root():
    return {"message" : "Hello World"} # returns simple info in json format

# get request for /items page, along with any item id following it in the url
@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q} # returns simple info in json format, the item id and any query parameters or none if none

@app.post("/items")
def create_items(item: Item):
    # add a new item to our local storage
    new_item = {"id": len(items) + 1, **item.dict()}
    items.append(new_item)
    return {"message": "Item created", "item": new_item}