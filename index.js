const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const e = require('express');
const app = express()

app.use(express.static(__dirname));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB") //instead of localhost, use 127.0.0.1:12017

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

const itemSchema = {
    name: { type: String, required: true }
}

const Item = mongoose.model('Item', itemSchema) //keep mongoose model constants capitalised and singular



//creating documents
const item1 = new Item({ name: 'get up' });
const item2 = new Item({ name: 'take a shit' });
const item3 = new Item({ name: 'get out of bed' });
const defaultItems = [item1, item2, item3]

//make a new schema for unique lists, having itemSchema as datatype

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model('List', listSchema)

//adding item stuff
async function insertItem(item) {
    await item.save()
    console.log('data inserted');
}

//if you wanna add multiple docs

// Item.insertMany([
//     item,item2,item3
// ]).then(function () {
//     console.log("Data inserted") // Success 
// }).catch(function (error) {
//     console.log(error)     // Failure 
// }); 





//if you wanna add one doc

// async function insertItem(item) {
//     await item.save()
//     console.log('data inserted');
// }

//insertItem()





//deleting stuff
async function deleteItem() {
    await Item.deleteOne({ name: 'eat bhature' });
    console.log('data deleted');
}

//deleteItem()

//route custom lists
app.get('/:route', function (req, res) {
    const customListName = req.params.route;
    //res.send(customListName)


    async function getDocs() {
        itemData = await List.findOne({ name: customListName });
        console.log('finding list');


        if (!itemData) {
            const list = new List({
                name: customListName,
                items: defaultItems
            })

            insertItem(list)
            res.redirect('/' + customListName)
            return
        }

        res.render('main', { Title: itemData['name'], List: itemData['items'] })

    }

    getDocs()

    // const list = new List({
    //     name: customListName,
    //     items: defaultItems
    // })

    // insertItem(list)
    //res.send('working')

})


app.get('/', function (req, res) {


    async function getDocs() {
        itemData = await Item.find({});

        if (itemData.length == 0) {
            Item.insertMany(defaultItems).then(function () {
                console.log("empty list, inserting data") // Success 
            }).catch(function (error) {
                console.log(error)     // Failure 
            });

            res.redirect('/')
            return
        }

        res.render('main', { Title: 'Today', List: itemData })

    }

    getDocs()

})

app.post('/add', (req, res) => {

    var newItem = new Item({ name: req.body.item });
    var listName = req.body.list;

    if (listName == 'Today') {

        var newItem = new Item({ name: req.body.item });
        insertItem(newItem)
        res.redirect('/')
    } else {

        async function getDoc() {
            var itemData = await List.findOne({ name: listName });
            itemData.items.push(newItem);
            insertItem(itemData)
            res.redirect('/' + listName)

        }

        getDoc()
    }


})

app.post('/delete', (req, res) => {

    var listName = req.body.deleteList;


    if (listName == 'Today') {

        async function deleteItem(item) {
            await Item.deleteOne({ name: item });
        }

        //deleteItem()

        Object.keys(req.body).forEach(element => {
            deleteItem(element)
        });
        console.log('deleting items');
        res.redirect('/')

    } else {

        const itemsToDelete = Object.keys(req.body);

        async function deleteItems() {
           
            var itemData = await List.deleteMany({ name: listName }, { items: {  name: { $in: itemsToDelete} } })
            itemData;

            console.log('deleting items');
            res.redirect('/' + listName)

        }

        deleteItems()

    }

})

app.listen('3000', () => {
    console.log('server running on port 3000');
})