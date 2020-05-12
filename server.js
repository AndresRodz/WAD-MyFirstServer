const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const validateToken = require('./middleware/validateToken');
const {Students} = require('./models/studentModel');

const app = express();
const jsonParser = bodyParser.json();

app.use(express.static("public"));
app.use(morgan('dev'));
app.use(validateToken);

let studentList = [
    {
        name: "Julie",
        id: 123
    },
    {
        name: "Alfredo",
        id: 456
    },
    {
        name: "Robert",
        id: 789
    },
    {
        name: "Martha",
        id: 837
    }
];

function middleware(req, res, next) {
    console.log("Inside the middleware");
    
    let newObj = {};

    newObj = {
        test: "This message was added in the middleware"
    };

    req.test = newObj;

    next();
}

app.get('/api/students', (req, res) => {
    console.log("Getting list of all students...");
    //console.log(req.test);

    //console.log(req.headers);

    Students
        .getAllStudents()
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Something is wrong with the database, try again later";
            return res.status(500).end();
        });

    return res.status(200).json(studentList);
});

app.get('/api/studentById', (req, res) => {
    console.log("Getting one student given the id parameter...");
    console.log(req.query);

    let id = req.query.id;
    console.log('id', id);

    if(!id) {
        res.statusMessage = "The id parameter is required";
        return res.status(406).end();
    }

    let result = studentList.find((student) => {
        if(student.id == id) {
            return student;
        }
    });

    if(!result) {
        res.statusMessage = `The student with id= ${id} was not found in the list`;
        return res.status(404).end();
    }

    return res.status(200).json(result);
});

app.get('/api/getStudentById/:id', (req, res) => {
    console.log("Getting one student given the id parameter...");
    console.log(req.params);

    let id = req.params.id;
    console.log('id', id);

    let result = studentList.find((student) => {
        if(student.id == id) {
            return student;
        }
    });

    if(!result) {
        res.statusMessage = `The student with id= ${id} was not found in the list`;
        return res.status(404).end();
    }

    return res.status(200).json(result);
});

app.post('/api/addStudent', jsonParser, (req, res) => {
    console.log("body", req.body);

    let id = req.body.id;
    let name = req.body.name;

    if(!id || !name) {
        res.statusMessage = "One of these parameters is missing in the request: 'id', 'name'";
        return res(406).end();
    }

    if(typeof(id) != 'number') {
        res.statusMessage = "The 'id' MUST be a number";
        return res(409).end();
    }

    /*let flag = true;

    for(let i = 0; i < studentList.length; i++) {
        if(studentList[i].id === id) {
            flag = !flag;
            break;
        }
    }

    if(flag) {
        let newStudent = {
            name: name,
            id: id
        };

        studentList.push(newStudent);
        return res.status(201).json(newStudent);
    }
    else {
        res.statusMessage = "The 'id' is already on the list";
        return res.status(409).end();
    }*/

    let newStudent = {name, id};

    console.log(newStudent);
    Students
        .createStudent(newStudent)
        .then(result => {
            //Handle id duplicate error
            console.log(result);
            if(result.errmsg) {
                res.statusMessage = "The 'id' belongs to another student. " + result.errmsg;
                return res.status(409).end();
            }
            return res.status(201).json(result);
        })
        .catch(err => {
            res.statusMessage = "Something is wrong with the database, try again later";
            return res.status(500).end();
        });
});

app.delete('api/removeStudent', (req, res) => {
    let id = req.query.id;

    if(!id) {
        res.statusMessage = "The id parameter is required";
        return res.status(406).end();
    }

    let studentToRemove = studentList.findIndex((student) => {
        if(student.id === Number(id)) {
            return true;
        }
    });

    if(studentToRemove < 0) {
        res.statusMessage = "The 'id' was not found in the student list";
        return res.status(400).end();
    }
    else {
        studentList.splice(studentToRemove, 1);

        return res.status(204).end();
    }
});

app.listen(8000, () => {
    console.log("This server is running on port 8000");

    new Promise((resolve, reject) => {
        const settings = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        };
        mongoose.connect('mongodb+srv://A01193126:A01193126!@cluster0-uula5.mongodb.net/studentsDB?retryWrites=true&w=majority', settings, (err) => {
            if(err) {
                return reject(err);
            }
            return resolve();
        })
    })
    .catch(err => {
        console.log(err);
    });
});

//Bases URL: http://localhost:8000/
//GET endpoint: http://localhost:8000/api/students
//GET by id: http://localhost:8000/api/studentById?id=123
//GET by id: http://localhost:8000/api/getStudentById/123
//POST a new student: http://localhost:8000/api/addStudent
//DELETE a student: http://localhost:8000/api/removeStudent