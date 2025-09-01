from fastapi import FastAPI

# creating an instance of our app
app = FastAPI()

@app.get("/") #returns information found on the root url
def read_root():
    return {"message" : "Hello World"}

@app.get("/items/{item_id}") #gets information found on the items and items/* urls
def read_items(item_id : int, q : str=None):
    return {"item_id": item_id, "q": q}

