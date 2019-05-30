const express = require('express'); //includes the express library
const cors = require('cors');
const app = express(); //have app be an instance of express
const path = require('path'); //includes the path library
const router = express.Router(); //have router variable act as an express router
let epochVal = 2; //set the default value of epoch 
var reverseVal = "deu.txt"; // holds the text file to run on execution
let {
    PythonShell
} = require('python-shell'); //includes the python-shell library and instanciates it 

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html')); //__dirname : It will resolve to your project folder.
});

app.get('/launch', launch); //runs the launch() function when request for '/launch' is given 
app.get('/evaluate', evaluate); //runs the evaluate() function when request for '/evaluate' is given 
app.get('/epoch', setEpoch); //runs the setEpoch() function when request for '/epoch' is given 
app.get('/reverse', setReverse); //runs the reverse() function when request for '/reverse' is given 

//changes the file that is used for data collection
function setReverse() {
    if (reverseVal == "deu.txt") {
        reverseVal = "deu2.txt";
    } else {
        reverseVal = "deu.txt";
    }
}

//sets how many iterations the machine learning algorithm would have to make better predictions
function setEpoch(req, res) {
    val = req.query;
    epochVal = val['epoch'];
}

//this function cleans the data from the file then splits the data up into parts and trains the machine learning algorithm
async function launch(req, res) {
    var options = {
        mode: 'text',
        args: [epochVal, reverseVal]
    };

    pyshell3 = new PythonShell('scripts/english-german.py', options);
    pyshell3.on('message', function (message) {
        console.log(message);
        res.write(message + "\n");
    });

    await sleep(10000);

    pyshell2 = new PythonShell('scripts/splitData.py', options);
    pyshell2.on('message', function (message) {
        console.log(message);
        res.write(message + "\n");
    });

    await sleep(10000);

    pyshell = new PythonShell('scripts/trainNeuralTranslation.py', options);
    pyshell.on('message', function (message) {
        console.log(message);
        res.write(message + "\n");
    });
}

//runs tests to see how well the machine learning algorithm predicts the correct answers
function evaluate(req, res) {
    let output2 = " ";
    var options = {
        mode: 'text',
        args: [epochVal, reverseVal]
    };

    PythonShell.run('scripts/evaluateNeuralNetwork.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        results.forEach(function (value) {
            console.log(value);
            output2 = output2 + value + "\n";
        });
        res.write(output2);
    });
}

//this function delays the execution of functions
function sleep(ms) {
    return new Promise(done => setTimeout(done, ms));
}

//makes the views folder visible to the server
app.use(express.static(__dirname + '/view'));
//makes the scripts folder visible to the server
app.use(express.static(__dirname + '/scripts'));
//makes the font folder visible to the server
app.use(express.static(__dirname + '/Fonts'));
//makes the images folder visible to the folder
app.use(express.static(__dirname + '/images'));

//when the root is called run router
app.use('/', router);

app.use(cors());

//runs the server on port 8080
app.listen(8080);
console.log('Running at Port 8080');