const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");

const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery',false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema=new mongoose.Schema({
  name:String
});

const Item=new mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your todolist!"
});

const item2=new Item({
  name:"Hit the + button to add a new item."
});

const item3=new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items: [itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  
  Item.find({}).then(function(foundItems){
    if(foundItems.length===0){

      Item.insertMany(defaultItems).then(function(){
        console.log("Saved successfully.");
      }).catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    }
    res.render("list",{listTitle:"Today",newListItems:foundItems});
  }).catch(function(err){
    console.log(err);
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item4=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item4.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName})
    .then(function(foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/"+listName);
    })
    .catch(function(err){
      console.log(err);
    });
  }

}); 

app.post("/delete", function(req, res){

  const checkedItemId=(req.body.checkbox);
  const listName=(req.body.listName);
  console.log(checkedItemId);
  console.log(listName);


  if(listName==="Today"){
    Item.findByIdAndDelete(checkedItemId).then(function(){
      console.log("Deleted");
    }).catch(function(err){
      console.log(err);
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(post=>{
      res.redirect("/"+listName);
    });
  }

});

app.get("/:customListName",function(req,res){
  const customListName=req.params.customListName;
  List.findOne({name:customListName})
  .then(function(foundList){
    
    if(foundList){
      console.log("FOUND");
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
    
    else{
      console.log("DED");

      const list=new List({
        name:customListName,
        items:defaultItems
      });

      list.save();
      console.log("SAVED NOW");
      res.redirect("/"+customListName);
    }

  }).catch(function(err){
    console.log(err);
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
