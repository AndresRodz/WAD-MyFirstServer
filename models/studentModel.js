const mongoose = require('mongoose');

const studentsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: Number,
        required: true,
        unique: true
    }
});

const studentsCollection = mongoose.model('students', studentsSchema);

const Students = {
    //nameProperty: function() {
    //}
    //nameProperty() {
    //}
    createStudent: function(newStudent) {
        return studentsCollection   //db.students.insert(newStudent);
            .create(newStudent)
            .then(createdStudent => {
                return createdStudent;
            })
            .catch(err => {
                return err;
            });
    },
    getAllStudents: function() {
        return studentsCollection
            .find()
            .then(allStudents => {
                return allStudents;
            })
            .catch(err => {
                return err;
            });
    },
    getByID: function(ID) {
        return studentsCollection
            .find({id: ID})
            .then(student => {
                return student;
            })
            .catch(err => {
                return err;
            });
    },
    remove: function() {

    },
    
};

module.exports = {Students};