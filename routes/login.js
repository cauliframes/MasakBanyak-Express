var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var secret = require('../secret');
var MongoClient = require('mongodb').MongoClient;

