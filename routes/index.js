const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi')
const mongoose = require('mongoose')
const db =  {


  dbconnect: function() {
      mongoose.connect('mongodb://localhost/vidly',{useNewUrlParser : true})
      .then( () => console.log("successfully connected to Database"))
      .catch( err => console.log(err.message))
  },
  

  Movie :  mongoose.model('Movie', mongoose.Schema({
     id: {type : Number},
     name : {type : String , required : true},
     genre : {type : String , required : true}
 })),
  getdata: async function(){
  //cnx database
  this.dbconnect()
    
  // defining a schema for movies
      //recup data 
      try{
          const data = await this.Movie.find()
          console.log(data)
          return data
      }
      catch(err){
          return err
      }
}

  
}        





/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.ejs', { title: 'Express' });
});


router.get('/db', async function(req, res, next) {
  const data = await db.getdata()
  res.render('database.fetch.ejs',{data : await data});
});



router.get('/db/:id' , async function(req, res, next){
  await db.dbconnect()

  try{
    const data = await db.Movie.findById(req.params.id)
    console.log(data);
    if ( !data ) return res.render('dberror.ejs')
    return res.render('editfilm.ejs',{data : await data});

  }
  catch(ex){
    console.log(ex.message)
  }


})

router.post('/db/:id' , async function(req, res, next){
  await db.dbconnect()
  function movieValidation(movie){
    const schema = {
      moviename : Joi.string().min(2).max(15).required(),
      moviegenre : Joi.string().min(3).max(10).required(), 
    }
    return Joi.validate(movie , schema)
  }
  const { error } = movieValidation(req.body)
  if (error) return res.render('form.error.ejs' , {error : error.details[0].message})


  
  // db saving  try....
  
  try {
    const movie = await  db.Movie.findByIdAndUpdate(req.params.id , {
      name : req.body.moviename,
      genre : req.body.moviegenre
    })
   console.log("update success ! ")
  }
  catch(err){
    console.log(err.message)
    return res.send('Erreur veuillez reessayer')
  }
  
  res.redirect('/db')


})



router.post('/' , function(req,res,next) {
  
  console.log(req.body);
  function validation (form){
    const schema = {
      name : Joi.string().min(3).max(30).required(),
      lastname : Joi.string().required(),
      mail: Joi.string().email({ minDomainSegments: 4 }).required(),
      birthdate: Joi.string().max(10).required()

    }
    return Joi.validate(form , schema)
  }
  const { error } = validation(req.body)
  if ( error ) {
    return res.status(400).render('form.error.ejs',{error : error.details[0].message})
  }

  res.render('form.success.ejs', { data : req.body})
  
  
  
})

//post form
router.get('/add' , function(req,res,next) {
  res.render('ajoutfilm.ejs')
});


//form post 
router.post('/add' , async function(req,res,next){
  
   db.dbconnect()

  console.log(req.body);
  // validation de la requete POST
  function movieValidation(movie){
    const schema = {
      moviename : Joi.string().min(2).max(30).required(),
      moviegenre : Joi.string().min(3).max(15).required(), 
    }
    return Joi.validate(movie , schema)
  }
  const { error } = movieValidation(req.body)
  if (error) return res.render('form.error.ejs' , {error : error.details[0].message})


  const movie =  new db.Movie({
    id : await db.Movie.countDocuments() + 1,
    name : req.body.moviename,
    genre : req.body.moviegenre
  })

  // db saving  try....
  
  try {
    await movie.save()
  }
  catch(err){
    console.log(err.message)
    return res.send('Erreur veuillez reessayer')
  }
  
  res.redirect('/db')

})

//deletion
router.get('/db/delete/:id' , async function(req,res,next){
    db.dbconnect()
    try{
      await db.Movie.findByIdAndDelete(req.params.id)
      res.redirect('/db')
    }
    catch(ex)
    {
      console.log(ex.message);
      res.send('An error has occured :( ')
    }

})



module.exports = router;
