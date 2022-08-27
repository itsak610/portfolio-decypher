var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
    level: {
      type: Number,
      unique: true
    },
    question: String,
    hint1: String,
    hint2: String,
    hint3: String,
    answer: String
});

QuestionSchema.statics.addQuestion = function(level, question, hint1, hint2, hint3, answer, callback) {
  var qs = new Question({
    level: level,
    question: question,
    hint1: hint1,
    hint2: hint2,
    hint3: hint3,
    answer: answer
  });
  qs.save(function(err) {
    if (err) {
      return callback(err);
    } else {
      return callback(null, qs);
    }
  });
}

QuestionSchema.statics.checkAnswer = function(level, answer, callback) {
  Question.findOne({ level: level }).exec(function(err, question) {
    if (question.answer == answer) {
      return callback(false);
    } else {
      return callback(true);
    }
  });
}

QuestionSchema.statics.getQuestion = function(level, callback) {
  Question.findOne({ level: level }).exec(function(err, level) {
    if (!level) {
      var isOver = true;
      return callback('', isOver);
    }
    else{
        var isOver = false;
        return callback(level.question, level.hint1, level.hint2, level.hint3, isOver);
    }
  });
}


var Question = mongoose.model('Question', QuestionSchema);
module.exports = Question;
