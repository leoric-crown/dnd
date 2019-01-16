const config = require('../../config/main')
const endpoint = `http://${config.host}:${config.port}/characters/`
const mongoose = require('mongoose')
const Character = require('../models/character.model')

const returnError = (err, res) => {
  res.status(500).json({
    error: err.toString()
  })
}

const createCharacter = async (req, res, next) => {
  try {
    const character = new Character ({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      level: req.body.level,
      armorclass: req.body.armorclass,
      hitpoints: (req.body.hitpoints == null ? req.body.maxhitpoints : req.body.hitpoints),
      maxhitpoints: req.body.maxhitpoints,
      conditions: (req.body.conditions == null ? [] : req.body.conditions),
      player: req.body.player
    })

    const result = await character.save()
    const add = {
      request: {
        type: 'GET',
        url: endpoint + character._id
      }
    }
    res.status(201).json({
      status: {
        code: 201,
        message: 'Successfully created new Character document'
      },
      createdCharacter: {
        ...character._doc,
        ...add
      }
    })
  }
  catch (err) {
    res.status(400).json({
      status:{
        code: 400,
        message: 'Error creating Character document'
      }
    })
  }
}

const getAllCharacters = async (req, res, next) => {
  try{
    const docs = await Character.find()
    .select('-__v')
    .exec()
    const response = {
      count: docs.length,
      characters: docs.map(doc => {
        const add = {
          request: {
            type: 'GET',
            url: endpoint + doc._id
          }
        }
        return {
          ...doc._doc,
          ...add
        }
      })
    }
    if(docs) {
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully fetched all Character documents'
        },
        ...response
      })
    } else {
      res.status(404).json({
        status: {
          code: 404,
          message: 'No documents in Character collection'
        }
      })
    }
  }
  catch(err) {
    res.status(400).json({
      status:{
        code: 400,
        message: 'Error getting Character documents'
      }
    })
  }
}

const getCharacter = async (req, res, next) => {
  try {
    const id = req.params.characterId
    const doc = await Character.findById(id)
    .select('-__v')
    .exec()
    if(doc) {
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully fetched Character document'
        },
        ...doc._doc
      })
    } else {
      res.status(404).json({
        status: {
          code: 404,
          message: 'No Character document found for provided ID'
        }
      })
    }
  }
  catch(err) {
    res.status(400).json({
      status:{
        code: 400,
        message: 'Error getting Character document'
      }
    })
  }
}

const patchCharacter = async (req, res, next) => {
  try{
    const id = req.params.characterId
    const updateOps = {}
    for(const ops of req.body) {
      updateOps[ops.propName] = ops.value
    }
    const result = await Character.updateOne({ _id: id }, { $set: updateOps }).exec()
    if(result.n === 0) {
      res.status(500).json({
        status: {
          code: 500,
          message: 'Patch failed: Character document not found'
        }
      })
    } else {
      const add = {
        request:{
          type: 'GET',
          url: endpoint + id
        }
      }
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully patched Character document'
        },
        ...result,
        ...{_id: id},
        ...add
      })
    }
  }
  catch (err) {
    res.status(400).json({
      status:{
        code: 400,
        message: 'Error patching Character document'
      }
    })
  }
}

const deleteCharacter = async (req, res, next) => {
  try {
    const id = req.params.characterId
    const result = await Character.deleteOne({ _id: id }).exec()
    res.status(200).json({
      status: {
        code: 200,
        message: 'Successfully deleted Character document'
      },
      ...result
    })
  }
  catch (err) {
    res.status(400).json({
      status:{
        code: 400,
        message: 'Error deleting Character document'
      }
    })
  }
}

const deleteAllCharacters = async (req, res, next) => {
  try {
    const result = await Character.remove().exec()
    res.status(200).json({
      status: {
        code: 200,
        message: 'Successfully deleted all Character documents'
      },
      ...result
    })
  }
  catch (err) {
    res.status(400).json({
      status:{
        code: 400,
        message: 'Error deleting all Character documents'
      }
    })
  }
}

module.exports = {
  createCharacter,
  getAllCharacters,
  getCharacter,
  patchCharacter,
  deleteCharacter,
  deleteAllCharacters
}